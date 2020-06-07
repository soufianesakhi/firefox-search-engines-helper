/// <reference path="./data.d.ts" />

/** @type {string} */
var xmlTemplate;
const searchTermsParam = "%s";
var browserVersion;
browser.runtime
  .getBrowserInfo()
  .then((infos) => (browserVersion = infos.version.split(".")[0]));

function addSearchEngine(
  searchURL,
  engineName,
  imageURL,
  successCallback,
  errorCallback
) {
  if (!xmlTemplate) {
    $.ajax({
      url: browser.extension.getURL("search-template.xml"),
      dataType: "text",
      async: false,
      success: (result) => {
        xmlTemplate = result;
      },
      error: errorCallback,
    });
  }
  searchURL = searchURL.replace(searchTermsParam, "{searchTerms}");
  let newSearchEngineXML = xmlTemplate
    .replace("{ShortName}", engineName)
    .replace("{Description}", engineName)
    .replace("{SearchURL}", htmlEscape(searchURL))
    .replace("{ImageURL}", htmlEscape(imageURL));

  let callback = (url) => {
    if (browserVersion > 77) {
      addSearchEngineAsAction({
        opensearchUrl: url,
        imageUrl: imageURL,
        title: engineName,
      });
    } else {
      // @ts-ignore
      window.external.AddSearchProvider(url);
    }
    successCallback();
  };
  postFileIO(newSearchEngineXML, callback, errorCallback);
}

/**
 * @param  {SearchEngineDefinition} definition
 */
async function addSearchEngineAsAction(definition) {
  const tab = await browser.tabs.create({
    url: "/pages/add-search-engine.html",
    active: true,
  });
  await browser.tabs.executeScript(tab.id, { file: "js/add-search-engine.js" });
  browser.tabs.sendMessage(tab.id, definition);
}

function postFileIO(newSearchEngineXML, successCallback, errorCallback) {
  var data = new FormData();
  data.append("file", new File([newSearchEngineXML], "search.xml"));
  $.ajax({
    url: "https://file.io/?expires=1",
    method: "POST",
    data: data,
    contentType: false,
    processData: false,
    success: (result) => {
      if (result.success) {
        // Wait for the file to be ready to avoid 404 errors
        setTimeout(() => {
          successCallback(result.link);
        }, 1000);
      } else {
        notify(
          "Error while preparing the search engine's xml definition: " +
            JSON.stringify(result)
        );
      }
    },
    error: errorCallback,
  });
}

/**
 * This method's code was taken from node-lz4 by Pierre Curto. MIT license.
 * @param {Uint8Array} input
 * @param {Uint8Array} output
 * @param {number} sIdx
 * @param {number} [eIdx]
 */
function decodeLz4Block(input, output, sIdx, eIdx) {
  sIdx = sIdx || 0;
  eIdx = eIdx || input.length;

  // Process each sequence in the incoming data
  for (var i = sIdx, j = 0; i < eIdx; ) {
    var token = input[i++];

    // Literals
    var literals_length = token >> 4;
    if (literals_length > 0) {
      // length of literals
      var l = literals_length + 240;
      while (l === 255) {
        l = input[i++];
        literals_length += l;
      }

      // Copy the literals
      var end = i + literals_length;
      while (i < end) {
        output[j++] = input[i++];
      }

      // End of buffer?
      if (i === eIdx) {
        return j;
      }
    }

    // Match copy
    // 2 bytes offset (little endian)
    var offset = input[i++] | (input[i++] << 8);

    // 0 is an invalid offset value
    if (offset === 0 || offset > j) {
      return -(i - 2);
    }

    // length of match copy
    var match_length = token & 0xf;
    var l = match_length + 240;
    while (l === 255) {
      l = input[i++];
      match_length += l;
    }

    // Copy the match
    var pos = j - offset; // position of the match copy in the current output
    var end = j + match_length + 4; // minmatch = 4
    while (j < end) {
      output[j++] = output[pos++];
    }
  }

  return j;
}

function readMozlz4File(file, onRead, onError) {
  let reader = new FileReader();

  reader.onload = function () {
    // @ts-ignore
    let input = new Uint8Array(reader.result);
    let output;
    let uncompressedSize = input.length * 3; // size estimate for uncompressed data!

    // Decode whole file.
    do {
      output = new Uint8Array(uncompressedSize);
      uncompressedSize = decodeLz4Block(input, output, 8 + 4); // skip 8 byte magic number + 4 byte data size field
      // if there's more data than our output estimate, create a bigger output array and retry (at most one retry)
    } while (uncompressedSize > output.length);

    output = output.slice(0, uncompressedSize); // remove excess bytes

    let decodedText = new TextDecoder().decode(output);
    onRead(decodedText);
  };

  if (onError) {
    reader.onerror = onError;
  }

  reader.readAsArrayBuffer(file); // read as bytes
}

/**
 * @param { Blob } file
 * @param { (searchEngines: any) => void } onParse
 **/
function parseBrowserEngines(file, onParse) {
  readMozlz4File(file, (json) => {
    try {
      let browserEnginesData = JSON.parse(json);
      /** @type {any[]} */
      let browserEngines = browserEnginesData["engines"];
      let searchEngines = {};
      browserEngines
        .filter((engine) => engine["_urls"] && !engine["_isBuiltin"])
        .forEach((engine) => {
          let name = engine["_name"];
          let iconURL = engine["_iconURL"];
          /** @type {string} */
          let searchURL = null;
          /** @type {any[]} */
          let urls = engine["_urls"];
          for (let i = 0; i < urls.length && !searchURL; i++) {
            let e = urls[i];
            if (!e.type || e.type.indexOf("suggestion") == -1) {
              searchURL = e.template;
              /** @type {any[]} */
              let params = e.params;
              if (params.length > 0) {
                searchURL += "?";
                params.forEach((param) => {
                  searchURL += param.name + "=" + param.value + "&";
                });
                searchURL = searchURL.substr(0, searchURL.length - 1);
              }
            }
          }
          searchURL = searchURL.replace(/\{searchTerms\}/g, "%s");
          searchEngines[name] = {
            searchURL: searchURL,
            iconURL: iconURL,
          };
        });
      onParse(searchEngines);
    } catch (e) {
      console.log(e);
      notify("The selected search.json.mozlz4 file is not valid");
    }
  });
}

/**
 * @param { Blob } file
 * @param { (obj: any) => void } onRead
 *
 **/
function parseJsonFile(file, onRead) {
  let reader = new FileReader();
  reader.onerror = console.error;
  reader.onload = function () {
    // @ts-ignore
    onRead(JSON.parse(reader.result));
  };
  reader.readAsText(file);
}

function htmlEscape(url) {
  let div = $("<div>").text(url);
  let html = div.html();
  div.remove();
  return html;
}

function extractHostname(url) {
  var a = document.createElement("a");
  a.href = url;
  if (a.protocol === "moz-extension:") {
    return "";
  }
  let hostname = a.hostname;
  a.remove();
  return hostname;
}

function notify(text, info) {
  browser.notifications.create({
    // @ts-ignore
    type: "basic",
    title: `Firefox Search Engines Helper${!info ? " Error" : ""}`,
    message: text,
  });
}

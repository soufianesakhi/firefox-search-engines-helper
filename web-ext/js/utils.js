/** @type {string} */
var xmlTemplate;
const searchTermsParam = "%s";
const openSearchTermsParam = "{searchTerms}";

function addSearchEngine({
  searchURL,
  engineName,
  imageURL,
  suggestionsURL = null,
  successCallback = null,
  errorCallback = null,
}) {
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
  searchURL = searchURL.replaceAll(searchTermsParam, openSearchTermsParam);
  let newSearchEngineXML = xmlTemplate
    .replace("{ShortName}", engineName)
    .replace("{Description}", engineName)
    .replace("{SearchURL}", htmlEscape(searchURL))
    .replace("{ImageURL}", htmlEscape(imageURL));
  if (suggestionsURL) {
    suggestionsURL = suggestionsURL.replaceAll(
      searchTermsParam,
      openSearchTermsParam
    );
    newSearchEngineXML = newSearchEngineXML.replace(
      "<Image",
      `<Url type="application/x-suggestions+json" template="${htmlEscape(
        suggestionsURL
      )}"/>\n  <Image`
    );
  }
  const url = getUrl(newSearchEngineXML);
  addSearchEngineAsAction({
    opensearchUrl: url,
    imageUrl: imageURL,
    title: engineName,
  });
  if (successCallback) {
    successCallback();
  }
}

/**
 * @param  {SearchEngineDefinition} definition
 */
async function addSearchEngineAsAction(definition) {
  const tab = await browser.tabs.create({
    url: "/pages/add-search-engine.html",
    active: true,
  });
  await browser.tabs.executeScript(tab.id, {
    file: "/js/add-search-engine.js",
  });
  browser.tabs.sendMessage(tab.id, definition);
}

const serverUrl = "https://http-request-echo-server.onrender.com/";

function getUrl(xml) {
  return serverUrl + encodeURIComponent(xml);
}

async function getFaviconIcoUrl(url) {
  const baseUrl = getBaseUrl(url);
  try {
    const result = await fetch(`${serverUrl}${baseUrl}`, {
      headers: {
        Accept: "application/vnd.favicon.url",
      },
    });
    return await result.text();
  } catch (err) {
    console.error(err);
    return "";
  }
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

function exportMozlz4(data) {
  const content = encodeMozlz4(data);
  var blobURL = URL.createObjectURL(new Blob([content]));
  var downloadLink = document.createElement("a");
  downloadLink.download = "search.json.mozlz4";
  downloadLink.href = blobURL;
  downloadLink.onclick = function () {
    $(downloadLink).remove();
  };
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

/**
 * @param { Blob } file
 * @param { (searchEngines: SearchEngineExport) => void } onParse
 **/
function parseBrowserEngines(file, onParse) {
  readMozlz4File(file, (json) => {
    try {
      let browserEnginesData = JSON.parse(json);
      /** @type {Array} */
      let browserEngines = browserEnginesData["engines"];
      /** @type {SearchEngineExport} */
      let searchEngines = {};
      browserEngines
        .filter(
          (engine) =>
            engine["_urls"] &&
            !engine["_isBuiltin"] &&
            !engine["_isAppProvided"]
        )
        .forEach((engine) => {
          let name = engine["_name"];
          let iconURL = engine["_iconURL"];
          let keyword = engine["_metaData"].alias || undefined;
          let searchURL = "";
          /** @type {Array} */
          const urls = engine["_urls"];
          let url = urls.find((url) => url.rels.includes("results"));
          if (!url) {
            url = urls.find((url) => url.rels.length == 0);
          }
          if (!url) {
            url = urls.shift();
          }
          searchURL = url.template;
          let suggestionsURL = urls.find(
            (url) => url.type == "application/x-suggestions+json"
          )?.template;
          /** @type {Array} */
          let params = url.params;
          if (params.length > 0) {
            const query = params
              .map((param) => `${param.name}=${param.value}`)
              .join("&");
            searchURL = `${searchURL}?${query}`;
          }
          if (!searchURL) {
            return;
          }
          searchURL = searchURL.replaceAll(
            /\{searchTerms\}/g,
            searchTermsParam
          );
          suggestionsURL = suggestionsURL?.replaceAll(
            /\{searchTerms\}/g,
            searchTermsParam
          );
          searchEngines[name] = {
            searchURL,
            iconURL,
            keyword,
            suggestionsURL,
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
 * @param { (obj: SearchEngineExport) => void } onRead
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

function getBaseUrl(url) {
  var a = document.createElement("a");
  a.href = url;
  if (a.protocol === "moz-extension:") {
    return "";
  }
  let baseUrl = a.protocol + "//" + a.hostname;
  a.remove();
  return baseUrl;
}

function notify(text, info) {
  browser.notifications.create({
    // @ts-ignore
    type: "basic",
    title: `Firefox Search Engines Helper${!info ? " Error" : ""}`,
    message: text,
  });
}

function displayLoader() {
  const container = document.createElement("div");
  container.id = "loader-container";
  container.innerHTML = `
    <div class="overlay">
      <div class="overlay__inner">
          <div class="overlay__content"><span class="spinner"></span></div>
      </div>
    </div>
  `;
  document.body.append(container);
}

function hideLoader() {
  document.getElementById("loader-container")?.remove();
}

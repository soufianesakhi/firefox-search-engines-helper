"use strict";

document.addEventListener("DOMContentLoaded", main);

/**
 * @param {string} content 
 * @param {string} filename 
 */
function exportFile(content, filename) {
	var textToSaveAsBlob = new Blob([content], { type: "application/json" });
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
	var downloadLink = document.createElement("a");
	downloadLink.download = filename ? filename : "export.json";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = function () {
		$(downloadLink).remove();
	}
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
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
	for (var i = sIdx, j = 0; i < eIdx;) {
		var token = input[i++];

		// Literals
		var literals_length = (token >> 4);
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
		var match_length = (token & 0xf);
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
		let input = new Uint8Array(reader.result);
		let output;
		let uncompressedSize = input.length * 3;	// size estimate for uncompressed data!

		// Decode whole file.
		do {
			output = new Uint8Array(uncompressedSize);
			uncompressedSize = decodeLz4Block(input, output, 8 + 4);	// skip 8 byte magic number + 4 byte data size field
			// if there's more data than our output estimate, create a bigger output array and retry (at most one retry)
		} while (uncompressedSize > output.length);

		output = output.slice(0, uncompressedSize);	// remove excess bytes

		let decodedText = new TextDecoder().decode(output);
		onRead(decodedText);
	};

	if (onError) {
		reader.onerror = onError;
	}

	reader.readAsArrayBuffer(file);	// read as bytes
};

function htmlEscape(url) {
	let div = $('<div>').text(url);
	let html = div.html();
	div.remove();
	return html;
}

function extractHostname(url) {
	var a = document.createElement('a');
	a.href = url;
	if (a.protocol === "moz-extension:") {
		return "";
	}
	let hostname = a.hostname;
	a.remove();
	return hostname;
}

const searchTermsParam = "%s";
/** @type {string} */
var xmlTemplate;
/** @type {JQuery} */
var searchURLInput;
/** @type {JQuery} */
var engineNameInput;
/** @type {JQuery} */
var iconURLInput;
/** @type {JQuery} */
var engineIconDiv;

function main() {
	searchURLInput = $("#AddEngineSearchURL");
	engineNameInput = $("#AddEngineName");
	iconURLInput = $("#AddEngineIconURL");
	engineIconDiv = $("#EngineIcon");
	$("#addSearchEngine").click(addSearchEngine);

	$("#exportBrowserEngine").change((ev) => {
		let file = ev.target['files'][0];
		readMozlz4File(file, json => {
			let browserEnginesData = JSON.parse(json);
			/** @type {any[]} */
			let browserEngines = browserEnginesData["engines"];
			let exportedBrowserEngines = {};
			browserEngines.forEach(engine => {
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
							params.forEach(param => {
								searchURL += param.name + "=" + param.value + "&";
							});
							searchURL = searchURL.substr(0, searchURL.length - 1);
						}
					}
				}
				searchURL = searchURL.replace(/\{searchTerms\}/g, "%s")
				exportedBrowserEngines[name] = {
					searchURL: searchURL,
					iconURL: iconURL
				}
			});
			exportFile(JSON.stringify(exportedBrowserEngines, null, 4), "all-browser-engines.json");
		});
	});

	searchURLInput[0].oninput = (ev) => {
		let iconURL = iconURLInput.val().toString();
		if (iconURL.length > 0) {
			return;
		}
		let url = searchURLInput.val().toString();
		if (url.indexOf(searchTermsParam) == -1) {
			return;
		}
		let hostname = extractHostname(url);
		if (hostname.length > 0) {
			iconURLInput.val("https://www.google.com/s2/favicons?domain=" + hostname);
			refreshEngineIcon();
			if (engineNameInput.val().toString().length == 0) {
				engineNameInput.val(hostname.replace("www.", ""));
			}
		}
	};

	iconURLInput[0].oninput = refreshEngineIcon;
}

function refreshEngineIcon() {
	let img = document.createElement("img");
	img.src = iconURLInput.val().toString();
	engineIconDiv.empty().append(img);
}

function addSearchEngine() {
	if (!xmlTemplate) {
		$.ajax({
			url: browser.extension.getURL("search-template.xml"),
			dataType: "text",
			async: false,
			success: (result) => {
				xmlTemplate = result;
			},
			error: ajaxErrorCallback
		});
	}

	let engineName = engineNameInput.val().toString().trim();
	let searchURL = searchURLInput.val().toString().trim();
	let imageURL = iconURLInput.val().toString().trim();
	let invalid = engineName.length == 0 || searchURL.length == 0 || imageURL.length == 0;
	invalid = invalid || searchURL.indexOf(searchTermsParam) == -1;
	if (invalid) {
		console.log("Error validating the inputs: '" + engineName + "', '" + searchURL + "', '" + imageURL + "'");
		return;
	}

	searchURL = searchURL.replace(searchTermsParam, "{searchTerms}");
	let newSearchEngineXML = xmlTemplate
		.replace("{ShortName}", engineName)
		.replace("{Description}", engineName)
		.replace("{SearchURL}", htmlEscape(searchURL))
		.replace("{ImageURL}", htmlEscape(imageURL));

	var data = new FormData();
	data.append("randomname", "xml");
	data.append("file", new File([newSearchEngineXML], "search.xml"));
	$.ajax({
		url: "https://uguu.se/api.php?d=upload-tool",
		method: "POST",
		data: data,
		contentType: false,
		processData: false,
		success: (url) => {
			addSearchProvider(url);
			engineNameInput.val("");
			searchURLInput.val("");
			iconURLInput.val("");
			engineIconDiv.empty();
		},
		error: ajaxErrorCallback
	});
}

function addSearchProvider(url) {
	// @ts-ignore
	window.external.AddSearchProvider(url);
}

/**
 * @param {JQuery.jqXHR} jqXHR 
 * @param {JQuery.Ajax.ErrorTextStatus} textStatus 
 * @param {string} errorThrown 
 */
function ajaxErrorCallback(jqXHR, textStatus, errorThrown) {
	console.log(errorThrown);
}

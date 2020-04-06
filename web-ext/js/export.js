"use strict";

$("#exportBrowserEngine").change((ev) => {
  let file = ev.target["files"][0];
  parseBrowserEngines(file, (searchEngines) => {
    exportFile(
      JSON.stringify(searchEngines, null, 4),
      "all-browser-engines.json"
    );
  });
});

/**
 * @param {string} content
 * @param {string} filename
 */
function exportFile(content, filename) {
  var textToSaveAsBlob = new Blob([content], { type: "application/json" });
  var textToSaveAsURL = URL.createObjectURL(textToSaveAsBlob);
  var downloadLink = document.createElement("a");
  downloadLink.download = filename ? filename : "export.json";
  downloadLink.href = textToSaveAsURL;
  downloadLink.onclick = function () {
    $(downloadLink).remove();
  };
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

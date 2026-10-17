"use strict";

$("#exportBrowserEngine").change((ev) => {
  let file = ev.target["files"][0];
  parseBrowserEngines(file, (searchEngines) => {
    exportFile(
      JSON.stringify(searchEngines, null, 4),
      "all-browser-engines.json",
    );
  });
});

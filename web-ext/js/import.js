var importJsonInput;
var mozlz4SearchInput;
/** @type {number} */
var lastImportWaitTime;
/** @type {number} */
var importCount = 0;

$("#importJsonInput").change((ev) => {
  importJsonInput = ev.target["files"][0];
});

$("#mozlz4SearchInput").change((ev) => {
  mozlz4SearchInput = ev.target["files"][0];
});

function resetFileInputs() {
  $("#importJsonInput").val("");
  $("#mozlz4SearchInput").val("");
}

$("#importEngines").click(submitImportSearchEngines);

function submitImportSearchEngines() {
  if (!(importJsonInput && mozlz4SearchInput)) {
    notify(
      "Both the exported json and search.json.mozlz4 files must be selected"
    );
    return;
  }
  parseBrowserEngines(mozlz4SearchInput, (searchEngines) => {
    parseJsonFile(importJsonInput, (importedEngines) => {
      const existingSearchEngines = Object.keys(searchEngines);
      const enginesToImport = Object.keys(importedEngines)
        .filter((name) => existingSearchEngines.indexOf(name) == -1)
        .map((name) => {
          return {
            searchName: name,
            searchURL: importedEngines[name].searchURL,
            iconURL: importedEngines[name].iconURL,
          };
        });
      if (enginesToImport.length > 0) {
        importSearchEngines(enginesToImport);
      } else {
        notify("No new search engine found", true);
      }
    });
  });
  resetFileInputs();
}

/**
 * @param { any[] } enginesToImport
 **/
function importSearchEngines(enginesToImport) {
  if (enginesToImport.length == 0) {
    notify("Search engines successfully imported !", true);
    return;
  }
  let searchEngine = enginesToImport.pop();
  console.log("Importing the search engine: " + searchEngine.searchName);
  addSearchEngine(
    searchEngine.searchURL,
    searchEngine.searchName,
    searchEngine.iconURL,
    () => {
      const currentTime = Date.now();
      if (!lastImportWaitTime) {
        lastImportWaitTime = currentTime;
      }
      let wait = ++importCount == 5;
      let delay = 2000;
      if (wait) {
        delay = 60000 - (currentTime - lastImportWaitTime);
        lastImportWaitTime = currentTime;
        importCount = 0;
      }
      setTimeout(() => {
        importSearchEngines(enginesToImport);
      }, delay);
      if (wait) {
        notify(
          "Due to file.io limits, the import will resume after a period of " +
            Math.abs(delay / 1000) +
            " seconds",
          true
        );
      }
    },
    (jqXHR, textStatus, errorThrown) => {
      enginesToImport.push(searchEngine);
      setTimeout(() => {
        importSearchEngines(enginesToImport);
      }, 10000);
      notify(
        "Error while importing the search engine, retrying after 10 seconds...\n\nError details: " +
          jqXHR.responseText || JSON.stringify(jqXHR)
      );
    }
  );
}

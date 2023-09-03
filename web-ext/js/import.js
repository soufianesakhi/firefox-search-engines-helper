var importJsonInput;
var mozlz4SearchInput;

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
            suggestionsURL: importedEngines[name].suggestionsURL,
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
 * @param { SearchEngine[] } enginesToImport
 **/
function importSearchEngines(enginesToImport) {
  enginesToImport.forEach(
    ({
      searchURL,
      searchName: engineName,
      iconURL: imageURL,
      suggestionsURL,
    }) => {
      addSearchEngine({ searchURL, suggestionsURL, engineName, imageURL });
    }
  );
}

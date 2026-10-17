(function () {
  let importJsonInput;

  $("#importJsonInput").change((ev) => {
    importJsonInput = ev.target["files"][0];
    submitImportSearchEngines();
  });

  function resetFileInputs() {
    $("#importJsonInput").val("");
  }

  async function submitImportSearchEngines() {
    const searchEngines = await browser.search.get();
    const existingSearchEngines = searchEngines.map(
      (searchEngine) => searchEngine.name,
    );
    parseJsonFile(importJsonInput, (importedEngines) => {
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
      },
    );
  }
})();

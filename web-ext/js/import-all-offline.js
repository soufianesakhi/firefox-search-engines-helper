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

$("#importEnginesOffline").click(submitImportSearchEngines);

function submitImportSearchEngines() {
  if (!(importJsonInput && mozlz4SearchInput)) {
    notify(
      "Both the exported json and search.json.mozlz4 files must be selected"
    );
    return;
  }
  parseJsonFile(importJsonInput, (importedEngines) => {
    readMozlz4File(mozlz4SearchInput, (json) => {
      try {
        let browserEnginesData = JSON.parse(json);
        /** @type {any[]} */
        let browserEngines = browserEnginesData["engines"];
        const existingSearchEngines = browserEngines.map(
          (engine) => engine["_name"]
        );

        const searchNames = Object.keys(importedEngines).filter(
          (name) => existingSearchEngines.indexOf(name) < 0
        );
        searchNames.forEach((searchName) => {
          const engine = importedEngines[searchName];
          const metaData = {};
          if (engine.keyword) {
            metaData.alias = engine.keyword;
          }
          const browserEngine = {
            __searchForm: "",
            _isBuiltin: false,
            _iconURL: engine.iconURL,
            _loadPath: `[other]/search-engines-helper`,
            _metaData: metaData,
            _name: searchName,
            _shortName: searchName,
            _urls: [
              {
                params: [],
                rels: [],
                resultDomain: "",
                template: engine.searchURL.replace(/%s/g, "{searchTerms}"),
              },
            ],
            description: searchName,
            queryCharset: "UTF-8",
          };
          if (engine.suggestionsURL) {
            browserEngine._urls.push({
              params: [],
              rels: [],
              resultDomain: "",
              template: engine.suggestionsURL.replace(/%s/g, "{searchTerms}"),
              type: "application/x-suggestions+json",
            });
          }
          browserEngines.push(browserEngine);
        });
        if (searchNames.length > 0) {
          exportMozlz4(JSON.stringify(browserEnginesData));
        } else {
          notify("No new search engine found", true);
        }
      } catch (e) {
        console.log(e);
        notify("Error while parsing the input files");
      }
    });
  });
  resetFileInputs();
}

# Search Engines Helper for Firefox

![menu](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/menu.PNG)

## Adding a custom search engine

First begin by filling the search url, the two other inputs will be filled automatically with suggested values that can be customized if needed.
The search engine icon will be rendered to be sure that the url is valid.

When the inputs are ready, press the "Add search engine" button.

A confirmation window will be displayed to add the search engine.

(Due to technical limitations, no API is available to directly add a search engine from an extension starting with Firefox 57, that's why the website uguu.se is used to temporarily host the open search xml that will be used by Firefox to add the engine.)

![add-search-engine-confirmation](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine-confirmation.PNG)

After the confirmation, the search engine will be available for use.

![add-search-engine](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine.PNG)

## Exporting All the search engines

For customization purposes, the export of all the search engines can be useful when there is a need to change for example an icon of an existent search engine.
The search url obtained after an export can be used to add the search engine with the new icon (the search engine must be first deleted using the about:preferences#search page before adding it with the same name)
There can be other applications in the future.

![browse-export-all-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/browse-export-all-search-engines.PNG)

After selecting the "search.json.mozlz4" file from the profile folder (http://kb.mozillazine.org/Profile_folder_-_Firefox), the "all-browser-engines.json" file will be available to download.
This file contains all the search urls and icon urls for all search engines added to Firefox.

![export-all-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/export-all-search-engines.PNG)


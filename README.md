# Search Engines Helper for Firefox

https://addons.mozilla.org/en-US/firefox/addon/search-engines-helper/

The menu is accessible from the add-on's toolbar icon:

![menu](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/menu.PNG)

## Adding a custom search engine

![add-search-engine](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine.PNG)

First begin by filling the search url, the two other inputs will be filled automatically with suggested values that can be customized if needed.
The search engine icon will be rendered to be sure that the url is valid.

When the inputs are ready, press the "Add search engine" button.

On Firefox 78 or later, a page will be opened with the search engine available to install from the search bar menu or the page actions menu (detailed instructions are displayed on the same page).

![menu](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/web-ext/images/Add%20from%20page%20actions%20menu.png)

On Firefox 77 and earlier, a confirmation window will be displayed to add the search engine.

![add-search-engine-confirmation](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine-confirmation.PNG)

(Due to technical limitations, no API is available to directly add a search engine from an extension starting with Firefox 57, that's why the website file.io is used to temporarily host the open search xml that will be used by Firefox to add the engine.)

After the confirmation, the search engine will be available for use.

![added-search-engine](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/added-search-engine.PNG)

## Exporting All the search engines

### Use cases
This feature is useful in the following cases:
- Import the search engines later or on another firefox instance.
- To change for example an icon of an existing search engine. The search url obtained after an export can be used to add the search engine with the new icon (the search engine must be first deleted using the about:preferences#search page before adding it with the same name).

![export-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/export.PNG)

### Usage
![browse-export-all-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/browse-export-all-search-engines.PNG)

After selecting the "search.json.mozlz4" file from the profile folder (http://kb.mozillazine.org/Profile_folder_-_Firefox), the "all-browser-engines.json" file will be available to download.
This file contains all the search urls and icon urls for all search engines added to Firefox.

![export-all-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/export-all-search-engines.PNG)

## Import search engines

![import-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/import.PNG)

The search engines can be imported by selecting the following two files and then clicking the "Import" button:
- The previously exported json file
- the "search.json.mozlz4" file from the profile folder (http://kb.mozillazine.org/Profile_folder_-_Firefox)


Only search engines with names that are not already added to the current firefox instance will be imported.

Currently only 5 search engines can be imported each 60 seconds because of limitations imposed by the file.io host.
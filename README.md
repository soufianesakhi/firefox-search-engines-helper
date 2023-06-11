# Search Engines Helper for Firefox

https://addons.mozilla.org/en-US/firefox/addon/search-engines-helper/

The menu is accessible from the add-on's toolbar icon:

![menu](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/menu.PNG)

## Adding a custom search engine

You can right click on the search input field of any website to add a new search engine:

![add-search-engine-context-menu](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine-context-menu.png)

![add-search-engine](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/add-search-engine.PNG)

You can edit the search url manually, the two other inputs will be automatically filled with suggested values that can be customized if needed.

The search engine icon will be rendered to be sure that the url is valid.

After checking the inputs, you can press the "Add search engine" button.

A page will be opened with the search engine available to install from the search bar menu or the page actions menu (detailed instructions are displayed on the same page).

![add-search-engine](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/web-ext/images/Add%20search.png)

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

## Import search engines from a json file offline (requires file manipulation)

![import-search-engines](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/import-offline.PNG)

## Settings

From settings page, you can:

- Change the default favicon url that will be auto-filled after the search url input is entered
- Optionally display an input that can be used to test the search url with the provided search terms

![settings](https://raw.githubusercontent.com/soufianesakhi/firefox-search-engines-helper/master/screenshots/settings.PNG)

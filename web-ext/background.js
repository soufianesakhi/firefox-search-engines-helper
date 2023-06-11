const contextMenuId = "add-search-engine-from-input";

browser.contextMenus.create({
  id: contextMenuId,
  title: "Add search engine",
  contexts: ["editable"],
});

browser.contextMenus.onClicked.addListener(async (_info, tab) => {
  const [searchURL] = await browser.tabs.executeScript(tab.id, {
    file: "/actions/get-search-url.js",
  });
  await browser.tabs.create({
    url: browser.runtime.getURL(
      `/pages/add.html?searchURL=${encodeURIComponent(searchURL)}`
    ),
  });
});

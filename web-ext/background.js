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
  await openOrUpdateInternalTab("/pages/add.html", {
    searchURL,
  });
});

async function openOrUpdateInternalTab(pagePath, queryParams = {}) {
  // 1. Get the fully resolved internal base URL (e.g., "moz-extension://UUID/page.html")
  const baseUrl = browser.runtime.getURL(pagePath);

  // 2. Build the new URL with the updated query parameters
  const urlObj = new URL(baseUrl);
  Object.keys(queryParams).forEach((key) =>
    urlObj.searchParams.set(key, queryParams[key]),
  );
  const targetUrl = urlObj.toString();

  // 3. Find any existing tab running this specific extension page
  // We use a wildcard query since the old tab might have different query parameters
  const allTabs = await browser.tabs.query({});
  const existingTab = allTabs.find(
    (tab) => tab.url && tab.url.startsWith(baseUrl),
  );

  if (existingTab) {
    // 4. Update the existing tab with the new URL and bring it to focus
    await browser.tabs.update(existingTab.id, { url: targetUrl, active: true });
    await browser.windows.update(existingTab.windowId, { focused: true });
  } else {
    // 5. If it doesn't exist, create it fresh with the parameters
    await browser.tabs.create({ url: targetUrl });
  }
}

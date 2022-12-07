$("#add-new").click(() => openTab("/pages/add.html"));

$("#export-all").click(() =>
  openPage("pages/export.html", "Export all search engines to json file")
);

$("#import-all").click(() =>
  openPage("pages/import.html", "Import search engines from a json file")
);

$("#import-all-offline").click(() => openTab("/pages/import-all-offline.html"));

function openTab(pagePath) {
  browser.tabs.create({
    url: pagePath,
    active: true,
  });
  window.close();
}

function openPage(pagePath, titlePreface) {
  browser.windows.create({
    titlePreface: titlePreface,
    // @ts-ignore
    type: "detached_panel",
    url: pagePath,
    width: 600,
    height: 300,
  });
  window.close();
}

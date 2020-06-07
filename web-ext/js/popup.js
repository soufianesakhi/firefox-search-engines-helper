$("#add-new").click(() =>
  browser.tabs.create({
    url: "/pages/add.html",
    active: true,
  })
);

$("#export-all").click(() =>
  openPage("pages/export.html", "Export all search engines to json file")
);

$("#import-all").click(() =>
  openPage("pages/import.html", "Import search engines from a json file")
);

function openPage(pagePath, titlePreface) {
  browser.windows.create({
    titlePreface: titlePreface,
    // @ts-ignore
    type: "detached_panel",
    url: pagePath,
    width: 600,
    height: 300,
  });
}

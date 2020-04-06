$("#add-new").click(() => activatePopupMenu("add-new-menu"));
$(".back-item").click(() => activatePopupMenu("main-menu"));

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

function activatePopupMenu(menuId) {
  $(".popup-menu").hide();
  $(`#${menuId}`).show();
}

var searchURLInput = $("#AddEngineSearchURL");
var engineNameInput = $("#AddEngineName");
var iconURLInput = $("#AddEngineIconURL");
var engineIconDiv = $("#EngineIcon");
$("#addSearchEngine").click(submitSearchEngine);

searchURLInput[0].oninput = (ev) => {
  let iconURL = iconURLInput.val().toString();
  if (iconURL.length > 0) {
    return;
  }
  let url = searchURLInput.val().toString();
  if (url.indexOf(searchTermsParam) == -1) {
    return;
  }
  let hostname = extractHostname(url);
  if (hostname.length > 0) {
    iconURLInput.val("https://www.google.com/s2/favicons?domain=" + hostname);
    refreshEngineIcon();
    if (engineNameInput.val().toString().length == 0) {
      engineNameInput.val(hostname.replace("www.", ""));
    }
  }
};

iconURLInput[0].oninput = refreshEngineIcon;

function refreshEngineIcon() {
  let img = document.createElement("img");
  img.src = iconURLInput.val().toString();
  engineIconDiv.empty().append(img);
}

function submitSearchEngine() {
  let engineName = engineNameInput.val().toString().trim();
  let searchURL = searchURLInput.val().toString().trim();
  let imageURL = iconURLInput.val().toString().trim();
  let invalid =
    engineName.length == 0 || searchURL.length == 0 || imageURL.length == 0;
  invalid = invalid || searchURL.indexOf(searchTermsParam) == -1;
  if (invalid) {
    console.log(
      "Error validating the inputs: '" +
        engineName +
        "', '" +
        searchURL +
        "', '" +
        imageURL +
        "'"
    );
    return;
  }
  addSearchEngine(
    searchURL,
    engineName,
    imageURL,
    postSuccess,
    ajaxErrorCallback
  );
}

function postSuccess() {
  engineNameInput.val("");
  searchURLInput.val("");
  iconURLInput.val("");
  engineIconDiv.empty();
}

/**
 * @param {JQuery.jqXHR} jqXHR
 * @param {JQuery.Ajax.ErrorTextStatus} textStatus
 * @param {string} errorThrown
 */
function ajaxErrorCallback(jqXHR, textStatus, errorThrown) {
  console.log(textStatus + ": " + errorThrown);
  console.error(jqXHR);
}

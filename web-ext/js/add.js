var searchURLInput = $("#AddEngineSearchURL");
var engineNameInput = $("#AddEngineName");
var iconURLInput = $("#AddEngineIconURL");
var engineIconDiv = $("#EngineIcon");
var loadImageInput = $("#loadImage");
$("#addSearchEngine").click(submitSearchEngine);
loadImageInput.change(loadImage);

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
  if (searchURL.length == 0) {
    notify("The search URL cannot be empty");
    return;
  }
  if (engineName.length == 0) {
    notify("The search name cannot be empty");
    return;
  }
  if (imageURL.length == 0) {
    notify("The image URL cannot be empty");
    return;
  }
  if(searchURL.indexOf(searchTermsParam) == -1) {
    notify(`"${searchTermsParam}" missing from the search URL`);
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

function loadImage(ev) {
  /** @type {Blob} */
  const file = ev.target["files"][0];
  const reader = new FileReader()
  reader.onloadend = () => {
    // @ts-ignore
    $("#AddEngineIconURL").val(reader.result);
  }
  reader.onerror = () => {
    notify("Error while loading the image: " + JSON.stringify(reader.error));
  }
  reader.readAsDataURL(file);
}

function postSuccess() {
  engineNameInput.val("");
  searchURLInput.val("");
  iconURLInput.val("");
  loadImageInput.val("");
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

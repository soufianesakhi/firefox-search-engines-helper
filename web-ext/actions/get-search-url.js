function getSearchURL() {
  const input = /** @type {HTMLInputElement} */ (document.activeElement);
  const form = /** @type {HTMLFormElement} */ (input.closest("form"));
  const searchURL = new URL(form.action);

  const formData = new FormData(form);
  const params = {};
  formData.forEach((value, key) => (params[key] = value));
  params[input.name] = "%s";
  const query = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  searchURL.search = query;

  return [searchURL.toString()];
}

getSearchURL();

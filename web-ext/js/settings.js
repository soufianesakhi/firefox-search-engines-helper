/**
 * @implements {Option}
 */
class SelectBoxOption {
  /**
   * @param {string} id
   * @param {boolean} defaultValue
   */
  constructor(id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  async restore() {
    const result = await fetchObject(this.id, this.defaultValue);
    /** @type {HTMLSelectElement} */
    const element = query(`#${this.id}`);
    element.value = result;
  }

  async save() {
    /** @type {HTMLSelectElement} */
    const element = query(`#${this.id}`);
    storeObject(this.id, element.value);
  }
}

/**
 * @implements {Option}
 */
class CheckBoxOption {
  /**
   * @param {string} id
   * @param {boolean} defaultValue
   */
  constructor(id, defaultValue) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  async restore() {
    const result = await fetchBoolean(this.id, this.defaultValue);
    /** @type {HTMLInputElement} */
    const element = query(`#${this.id}`);
    element.checked = result;
  }

  async save() {
    /** @type {HTMLInputElement} */
    const input = query(`#${this.id}:checked`);
    storeBoolean(this.id, !!input);
  }
}

/**
 * @type {Option[]}
 */
let options = [];

/**
 * @param {string} id
 * @param {boolean} defaultValue
 * @returns {Option}
 */
function buildOption(id, defaultValue) {
  if (typeof defaultValue == "boolean") {
    return new CheckBoxOption(id, defaultValue);
  }
  return new SelectBoxOption(id, defaultValue);
}

/**
 * @param  {Event} e
 */
async function saveOptions(e) {
  e.preventDefault();
  await Promise.all(options.map((option) => option.save()));
  alert("Settings saved");
}

async function restoreOptions() {
  const settings = await getSettings();
  Object.keys(settings).forEach((id) => {
    const option = buildOption(id, settings[id]);
    options.push(option);
    option.restore();
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
query("form").addEventListener("submit", saveOptions);

/**
 * @param  {string} selector
 * @returns {any}
 */
function query(selector) {
  return document.querySelector(selector);
}

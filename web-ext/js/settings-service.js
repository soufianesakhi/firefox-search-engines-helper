/**
 * @type {Settings}
 */
const DEFAULT_SETTINGS = {
  faviconService: "",
  testSearchUrl: false,
};

async function getSettings() {
  const settings = { ...DEFAULT_SETTINGS };
  await Promise.all(
    Object.keys(DEFAULT_SETTINGS).map(async (key) => {
      const value = await fetchObject(key, DEFAULT_SETTINGS[key]);
      settings[key] = value;
    })
  );
  return settings;
}

async function fetchObject(id, defaultValue) {
  const value = localStorage.getItem(id);
  return (value && JSON.parse(value)) || defaultValue;
}

async function storeObject(id, obj) {
  localStorage.setItem(id, obj ? JSON.stringify(obj) : null);
}

async function fetchBoolean(id, defaultValue) {
  const value = localStorage.getItem(id);
  if (value != null) {
    return value === "true";
  } else {
    return defaultValue;
  }
}

async function storeBoolean(id, obj) {
  localStorage.setItem(id, "" + obj);
}

/// <reference path="./data.d.ts" />

const opensearch_xml_mime_type = "application/opensearchdescription+xml";

/**
 * @param  {SearchEngineDefinition} definition
 */
function appendSearchEngineLinks(definition) {
  const iconLink = document.createElement("link");
  iconLink.rel = "icon";
  iconLink.href = definition.imageUrl;
  document.head.appendChild(iconLink);

  const searchLink = document.createElement("link");
  searchLink.rel = "search";
  searchLink.type = opensearch_xml_mime_type;
  searchLink.href = definition.opensearchUrl;
  searchLink.title = definition.title;
  document.head.appendChild(searchLink);
}

browser.runtime.onMessage.addListener(appendSearchEngineLinks);

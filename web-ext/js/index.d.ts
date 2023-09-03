interface SearchEngineDefinition {
  opensearchUrl: string;
  imageUrl: string;
  title: string;
}

interface SearchEngine {
  searchName: string;
  searchURL: string;
  suggestionsURL?: string;
  iconURL: string;
}

interface SearchEngineDTO {
  searchURL: string;
  suggestionsURL?: string;
  iconURL: string;
  keyword: string;
}

type SearchEngineExport = { [name: string]: SearchEngineDTO };

interface Settings {
  faviconService: "favicon.ico" | "faviconkit" | "";
  testSearchUrl: boolean;
}

interface Option {
  restore(): Promise<any>;
  save(): Promise<any>;
}

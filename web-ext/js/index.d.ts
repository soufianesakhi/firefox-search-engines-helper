interface SearchEngineDefinition {
  opensearchUrl: string;
  imageUrl: string;
  title: string;
}

interface SearchEngine {
  searchName: string;
  searchURL: string;
  iconURL: string;
}

interface SearchEngineDTO {
  searchURL: string;
  iconURL: string;
  keyword: string;
}

type SearchEngineExport = { [name: string]: SearchEngineDTO };

interface Settings {
  faviconService: "favicon.ico" | "faviconkit" | "";
}

interface Option {
  restore();
  save(): Promise<any>;
}

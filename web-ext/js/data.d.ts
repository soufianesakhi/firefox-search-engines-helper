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

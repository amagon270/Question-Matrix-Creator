declare namespace QMatrix {
  type fact = {
    id: number;
    name: string;
    type: factType;
    negatedFacts: number[];
    theme: number;
    display?: string;
  }

  type factType = "bool" | "string" | "int";
  

}
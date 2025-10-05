//

export type ExampleSpec = {
  name: string,
  equivalent: string,
  sentence: string,
  translation: string
};
export type ExampleIndex = `${number}` | "last" | "all";

export type Language = "shaleian" | "fennese";
export type Orientation = "landscape" | "portrait";
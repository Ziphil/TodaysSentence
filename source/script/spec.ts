//

import fs from "fs/promises";
import yaml from "js-yaml";
import {ExampleSpec, Language} from "./type";


let specs = undefined as Array<ExampleSpec> | undefined;

export async function getExampleSpecs(language: Language): Promise<Array<ExampleSpec>> {
  if (specs === undefined) {
    specs = await loadExampleSpecs(language);
    return specs;
  } else {
    return specs;
  }
}

async function loadExampleSpecs(language: Language): Promise<Array<ExampleSpec>> {
  const yamlSpecs = await fs.readFile(`source/data/${language}.yaml`, {encoding: "utf-8"});
  const specs = yaml.load(yamlSpecs) as any;
  return specs;
}
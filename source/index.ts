//

import commandLineArgs from "command-line-args";
import {generateCompressedImages, generateImages, generatePages, generateStyle} from "./script/generate-image";
import {getExampleSpecs} from "./script/spec";
import {ExampleIndex, Language, Orientation} from "./script/type";


async function run(): Promise<void> {
  const options = commandLineArgs([
    {name: "index", alias: "i", multiple: true, defaultOption: true},
    {name: "language", alias: "l", type: String, defaultValue: "shaleian"},
    {name: "mode", alias: "m"}
  ]);
  const language = options.language as Language;
  const mode = options.mode as Orientation;
  const indices = options.index as Array<ExampleIndex>;
  await generate(language, mode, indices);
}

async function generate(language: Language, orientation: Orientation, indices: ExampleIndex | Array<ExampleIndex>): Promise<void> {
  const resolvedIndices = await resolveIndices(language, indices);
  await Promise.all([
    generatePages(language, orientation, resolvedIndices),
    generateStyle(language, orientation)
  ]);
  await generateImages(language, orientation, resolvedIndices);
  await generateCompressedImages(language, orientation, resolvedIndices);
  console.log("done");
}

async function resolveIndices(language: Language, indices: ExampleIndex | Array<ExampleIndex>): Promise<Array<number>> {
  const count = (await getExampleSpecs(language)).length;
  const actualIndices = Array.isArray(indices) ? indices : [indices];
  const resolvedIndices = actualIndices.map((index) => {
    if (index === "last") {
      return count - 1;
    } else if (index === "all") {
      return [...Array(count).keys()];
    } else {
      return parseInt(index);
    }
  }).flat();
  return resolvedIndices;
}

run().catch((error) => console.error(error));
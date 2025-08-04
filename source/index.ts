//

import commandLineArgs from "command-line-args";
import dotjs from "dot";
import fs from "fs/promises";
import yaml from "js-yaml";
import {convertCyrillicToLatin} from "ogorasso";
import pngToJpeg from "png-to-jpeg";
import puppeteer from "puppeteer";
import sass from "sass";
import "./declaration";


type ExampleSpec = {
  name: string,
  equivalent: string,
  sentence: string,
  translation: string
};
type ExampleIndex = `${number}` | "last" | "all";
type Language = "shaleian" | "fennese";
type ImageMode = "landscape" | "portrait";

function resolveIndices(indices: ExampleIndex | Array<ExampleIndex>, count: number): Array<number> {
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

async function loadExampleSpecs(language: Language): Promise<Array<ExampleSpec>> {
  const yamlSpecs = await fs.readFile(`source/data/${language}.yaml`, {encoding: "utf-8"});
  const specs = yaml.load(yamlSpecs) as any;
  return specs;
}

async function generatePages(specs: Array<ExampleSpec>, language: Language, mode: ImageMode, indices: Array<number>): Promise<void> {
  const template = await fs.readFile(`source/page/${mode}/template.html`, {encoding: "utf-8"});
  await Promise.all(indices.map(async (index) => {
    const spec = specs[index];
    const output = dotjs.template(template)({
      number: index + 1,
      language,
      name: spec.name,
      equivalent: spec.equivalent,
      sentences: [
        convertSentence(spec.sentence, language, 0),
        convertSentence(spec.sentence, language, 1)
      ],
      translation: spec.translation
    });
    await fs.mkdir(`out/${language}/${mode}/page`, {recursive: true});
    await fs.writeFile(`out/${language}/${mode}/page/${index + 1}.html`, output);
  }));
}

function convertSentence(sentence: string, language: Language, position: 0 | 1): string {
  if (language === "shaleian") {
    if (position === 0) {
      return sentence.replace(/’/g, "'");
    } else {
      return sentence;
    }
  } else {
    if (position === 0) {
      return sentence;
    } else {
      return convertCyrillicToLatin(sentence);
    }
  }
}

async function generateStyle(language: Language, mode: ImageMode): Promise<void> {
  const result = await sass.compileAsync(`source/page/${mode}/style.scss`);
  await fs.mkdir(`out/${language}/${mode}/page`, {recursive: true});
  await fs.writeFile(`out/${language}/${mode}/page/style.css`, result.css);
}

async function generateImages(language: Language, mode: ImageMode, indices: Array<number>): Promise<void> {
  const viewport = (mode === "landscape") ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
  const browser = await puppeteer.launch({defaultViewport: viewport});
  await Promise.all(indices.map(async (index) => {
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/out/${language}/${mode}/page/${index + 1}.html`);
    await page.waitForSelector("#main");
    const element = await page.$("#main");
    if (element !== null) {
      await fs.mkdir(`out/${language}/${mode}/image`, {recursive: true});
      await element.screenshot({path: `out/${language}/${mode}/image/${index + 1}.png`});
    }
    await page.close();
  }));
  await browser.close();
}

async function generateCompressedImages(language: Language, mode: ImageMode, indices: Array<number>): Promise<void> {
  const specs = await loadExampleSpecs(language);
  await Promise.all(indices.map(async (index) => {
    const buffer = await fs.readFile(`out/${language}/${mode}/image/${index + 1}.png`);
    const convertedBuffer = await pngToJpeg({quality: 100})(buffer) as any;
    await fs.writeFile(`out/${language}/${mode}/image/${index + 1}-comp.jpg`, convertedBuffer);
  }));
}

async function generate(language: Language, mode: ImageMode, indices: ExampleIndex | Array<ExampleIndex>): Promise<void> {
  const specs = await loadExampleSpecs(language);
  const resolvedIndices = resolveIndices(indices, specs.length);
  await Promise.all([
    generatePages(specs, language, mode, resolvedIndices),
    generateStyle(language, mode)
  ]);
  await generateImages(language, mode, resolvedIndices);
  await generateCompressedImages(language, mode, resolvedIndices);
  console.log("done");
}

async function run(): Promise<void> {
  const options = commandLineArgs([
    {name: "index", alias: "i", multiple: true, defaultOption: true},
    {name: "language", alias: "l", type: String, defaultValue: "shaleian"},
    {name: "mode", alias: "m"}
  ]);
  const language = options.language as Language;
  const mode = options.mode as ImageMode;
  const indices = options.index as Array<ExampleIndex>;
  await generate(language, mode, indices);
}

run().catch((error) => console.error(error));
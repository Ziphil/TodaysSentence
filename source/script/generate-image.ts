//

import "../declaration";
import dotjs from "dot";
import fs from "fs/promises";
import {convertCyrillicToLatin} from "ogorasso";
import pngToJpeg from "png-to-jpeg";
import puppeteer from "puppeteer";
import sass from "sass";
import {getExampleSpecs} from "./spec";
import {Language, Orientation} from "./type";


export async function generatePages(language: Language, orientation: Orientation, indices: Array<number>): Promise<void> {
  const specs = await getExampleSpecs(language);
  const template = await fs.readFile(`source/page/${orientation}/template.html`, {encoding: "utf-8"});
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
    await fs.mkdir(`out/${language}/${orientation}/page`, {recursive: true});
    await fs.writeFile(`out/${language}/${orientation}/page/${index + 1}.html`, output);
  }));
}

export async function generateStyle(language: Language, orientation: Orientation): Promise<void> {
  const result = await sass.compileAsync(`source/page/${orientation}/style.scss`);
  await fs.mkdir(`out/${language}/${orientation}/page`, {recursive: true});
  await fs.writeFile(`out/${language}/${orientation}/page/style.css`, result.css);
}

export async function generateImages(language: Language, orientation: Orientation, indices: Array<number>): Promise<void> {
  const viewport = (orientation === "landscape") ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
  const browser = await puppeteer.launch({defaultViewport: viewport});
  await Promise.all(indices.map(async (index) => {
    const page = await browser.newPage();
    await page.goto(`file://${process.cwd()}/out/${language}/${orientation}/page/${index + 1}.html`);
    await page.waitForSelector("#main");
    const element = await page.$("#main");
    if (element !== null) {
      await fs.mkdir(`out/${language}/${orientation}/image`, {recursive: true});
      await element.screenshot({path: `out/${language}/${orientation}/image/${index + 1}.png`});
    }
    await page.close();
  }));
  await browser.close();
}

export async function generateCompressedImages(language: Language, orientation: Orientation, indices: Array<number>): Promise<void> {
  await Promise.all(indices.map(async (index) => {
    const buffer = await fs.readFile(`out/${language}/${orientation}/image/${index + 1}.png`);
    const convertedBuffer = await pngToJpeg({quality: 100})(buffer) as any;
    await fs.writeFile(`out/${language}/${orientation}/image/${index + 1}-comp.jpg`, convertedBuffer);
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
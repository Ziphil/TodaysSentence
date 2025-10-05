//

import "../declaration";
import {exec} from "child_process";
import fs from "fs/promises";
import {Language, Orientation} from "./type";


export async function generateVoice(language: Language, orientation: Orientation, indices: Array<number>): Promise<void> {
  console.log("[voice] START");
  await Promise.all(indices.map(async (index) => {
    const inputPath = `./source/data/${language}/${index + 1}.m4a`;
    const outputPath = `./out/${language}/${orientation}/movie/${index + 1}.m4a`;
    await fs.mkdir(`out/${language}/${orientation}/movie`, {recursive: true});
    await new Promise((resolve, reject) => void exec(
      `ffmpeg -i ${inputPath} -af "afftdn,silenceremove=start_periods=1:start_threshold=-65dB,areverse,silenceremove=start_periods=1:start_threshold=-65dB,areverse" -y ${outputPath}`,
      (error, stdout, stderr) => error ? reject(error) : resolve(stdout)
    ));
  }));
}

export async function generateMovie(language: Language, orientation: Orientation, indices: Array<number>): Promise<void> {
  console.log("[movie] START");
  await Promise.all(indices.map(async (index) => {
    const inputImagePath = `./out/${language}/${orientation}/image/${index + 1}.png`;
    const inputVoicePath = `./out/${language}/${orientation}/movie/${index + 1}.m4a`;
    const outputPath = `./out/${language}/${orientation}/movie/${index + 1}.mp4`;
    await fs.mkdir(`out/${language}/${orientation}/movie`, {recursive: true});
    await new Promise((resolve, reject) => void exec(
      `ffmpeg -loop 1 -i ${inputImagePath} -i ${inputVoicePath} -af "adelay=500|500,apad=pad_dur=0.5" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -y ${outputPath}`,
      (error, stdout, stderr) => error ? reject(error) : resolve(stdout)
    ));
  }));
}
/* eslint @typescript-eslint/no-var-requires: "off" */
import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import superagent from 'superagent';
import admZip from'adm-zip';

const mmaskURL =
    // 'https://github.com/MetaMask/metamask-extension/releases/download/v11.0.0/metamask-chrome-11.0.0.zip';
    'https://github.com/MetaMask/metamask-extension/releases/download/v12.0.0/metamask-chrome-12.0.0.zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const downloadPath = path.join(__dirname, 'metamask.zip');
const extractPath = path.join(__dirname, 'metamask');

console.log('downloadPath', downloadPath);
console.log('extractPath', extractPath);

export async function downloadMMask() {
    return new Promise((resolve, reject) => {
        superagent
            .get(mmaskURL)
            .pipe(fs.createWriteStream(downloadPath))
            .on('finish', function () {
                console.log('downloaded');

                const zip = new admZip(downloadPath);
                zip.extractAllTo(extractPath, true);
                resolve(true);
            });
    });
}

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const { Console } = require('console');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/process-url', async (req, res) => {
    const urlToProcess = req.body.url;
    const jsonUrl = await findJsonUrl(urlToProcess);
    const m3u8Url = convertToJsonUrl(jsonUrl);

    // Send the m3u8 URL to the frontend for streaming
    res.send({ streamUrl: m3u8Url, downloadLink: await fetchDownloadLink(m3u8Url) });
});


async function findJsonUrl(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let foundJson = false;
    let jsonUrl = '';

    page.on('response', async (response) => {
        const responseUrl = response.url();
        if (!foundJson && responseUrl.includes('deybpcaja6zfo.cloudfront.net') && responseUrl.endsWith('.json')) {
            jsonUrl = responseUrl;
            foundJson = true;
            await browser.close();
        }
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(10000);
    } catch (error) {
        console.error('Error during navigation:', error.message);
    } finally {
        if (!foundJson) {
            await browser.close();
        }
    }

    return jsonUrl;
}

function convertToJsonUrl(jsonUrl) {
    const idRegex = /deybpcaja6zfo.cloudfront.net\/([a-zA-Z0-9-]+)/;
    const match = jsonUrl.match(idRegex);
    return match ? `https://${match[0]}/hls_264/hd/master.m3u8` : '';
}

async function fetchDownloadLink(m3u8Url) {
    console.log((`https://youtube4kdownloader.com/download/video/${m3u8Url}`))
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(`https://youtube4kdownloader.com/download/video/${m3u8Url}`);
        await page.waitForSelector('a.downloadBtn');
    
        const downloadLink = await page.evaluate(() => {
            const linkElement = document.querySelector('a.downloadBtn');
            return linkElement ? linkElement.href : null;
        });
        return downloadLink;
        console.log(downloadLink);
    } catch (error) {
        console.error('Error during download link fetch:', error.message);
        return '';
    } finally {
        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
const puppeteer = require('puppeteer');

async function getDownloadLink(m3u8Url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://youtube4kdownloader.com/download/video/${m3u8Url}`);

    await page.waitForSelector('a.downloadBtn');

    const downloadLink = await page.evaluate(() => {
        const linkElement = document.querySelector('a.downloadBtn');
        return linkElement ? linkElement.href : null;
    });

    await browser.close();
    return downloadLink;
}

// Example usage
const m3u8Url = 'https://deybpcaja6zfo.cloudfront.net/3eafe923-0d13-4da2-b2a7-4cc8f8a70ee4/hls_264/hd/master.m3u8'; // Replace with your M3U8 URL
getDownloadLink(m3u8Url).then(link => {
    if (link) {
        console.log(`Download link: ${link}`);
        // You can also create a button or any other UI element to display this link
    } else {
        console.log('Download link not found.');
    }
});
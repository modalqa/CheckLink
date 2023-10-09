const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const csv = require('csv-parser');

const slackWebhookUrl = 'https://hooks.slack.com/services/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'; // Ganti dengan URL webhook Slack yang sesuai

async function sendSlackNotification(message) {
  try {
    await axios.post(slackWebhookUrl, { text: message });
    console.log('Slack notification sent.');
  } catch (error) {
    console.error(`Error sending Slack notification: ${error.message}`);
  }
}

async function checkLink(url) {
  try {
    const linkResponse = await axios.get(url);
    if (linkResponse.status !== 200) {
      const errorMessage = `Broken link found: ${url}`;
      console.log(errorMessage);
      await sendSlackNotification(errorMessage);
    }
  } catch (error) {
    const errorMessage = `Error checking link: ${url}, Error: ${error.message}`;
    console.error(errorMessage);
    await sendSlackNotification(errorMessage);
  }
}

async function checkBrokenLinksFromCSV(csvFilePath) {
  try {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        if (row.url) {
          await checkLink(row.url);
        }
      })
      .on('end', () => {
        console.log('Link checking completed.');
      });
  } catch (error) {
    console.error(`Error reading CSV file: ${error.message}`);
  }
}

const csvFilePath = 'list_urls.csv'; // Ganti dengan path ke file CSV yang sesuai
checkBrokenLinksFromCSV(csvFilePath);

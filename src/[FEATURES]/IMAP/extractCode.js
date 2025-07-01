import * as cheerio from 'cheerio';
import { simpleParser } from 'mailparser';
import Imap from 'imap';

export class CodeExtractor {
    constructor(imapConfig) {
        this.imap = new Imap(imapConfig);
    }

    extractCode(html) {
        const $ = cheerio.load(html);
        const selectors = [
            'td[bgcolor="#f1f1f1"]',
            'td[style*="bgcolor=#f1f1f1"]',
            'td[bgcolor="#f1f1f1"][style*="letter-spacing"]',
            'td[style*="border-radius:5px"][bgcolor="#f1f1f1"]',
            'td[style*="letter-spacing:20px"][bgcolor="#f1f1f1"]',
            'td[style*="background:#f1f1f1"]',
            'td[style*="background-color:#f1f1f1"]'
        ];

        for (const selector of selectors) {
            const element = $(selector);
            if (element.length) {
                const text = element.text().trim();
                const code = text.match(/\d{6}/)?.[0];
                if (code) {
                    this.sixDigitCode = code;
                    return code;
                }
            }
        }

        const allTds = $('td').filter((i, el) => {
            const bgcolor = $(el).attr('bgcolor') || $(el).css('background-color');
            const style = $(el).attr('style') || '';
            return (bgcolor === '#f1f1f1' || style.includes('f1f1f1'));
        });

        for (const td of allTds) {
            const text = $(td).text().trim();
            const code = text.match(/\d{6}/)?.[0];
            if (code) {
                this.sixDigitCode = code;
                return code;
            }
        }

        return null;
    }

    async getVerificationCode() {
        return new Promise((resolve, reject) => {
            let sixDigitCode = '';
            
            this.imap.once('ready', () => {
                this.imap.openBox('INBOX', false, async (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.searchEpicEmail(resolve, reject);
                });
            });

            this.imap.once('error', reject);
            this.imap.connect();
        });
    }

    async searchEpicEmail(resolve, reject) {
        try {
            const results = await this.searchEmails();
    
            if (!results.length) {
                process.stdout.write("Buscando código...\r"); // Usa \r para sobrescrever a linha
                setTimeout(() => this.searchEpicEmail(resolve, reject), 500);
                return;
            }
    
            for (const emailId of results.slice(-3).reverse()) {
                const email = await this.fetchEmail(emailId);
                if (email.from.text.includes('help@acct.epicgames.com')) {
                    let sixDigitCode = this.extractCode(email.html);
                    if (sixDigitCode) {
                        process.stdout.write(sixDigitCode);
                        this.imap.end();
                        resolve(sixDigitCode);
                        return;
                    }
                }
            }
            
            setTimeout(() => this.searchEpicEmail(resolve, reject), 500);
        } catch (error) {
            reject(error);
        }
    }

    searchEmails() {
        return new Promise((resolve) => {
            this.imap.search(['ALL'], (err, results) => {
                resolve(results || []);
            });
        });
    }

    async fetchEmail(id) {
        return new Promise((resolve, reject) => {
            const fetch = this.imap.fetch(id, { bodies: '' });
            fetch.on('message', msg => {
                msg.on('body', async stream => {
                    try {
                        resolve(await simpleParser(stream));
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });
    }
}
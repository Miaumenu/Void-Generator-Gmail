// imap.js
import { CodeExtractor } from './extractCode.js';
import { EmailCleaner } from './deleteEmails.js';

const imapConfig = {
    user: 'malmalmalmalmalmalmal123@gmail.com',
    password: 'ybun nojk wfzb wxhl',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

export default class EpicCodeExtractor {
    async getVerificationCode() {
        try {
            const extractor = new CodeExtractor(imapConfig);
            const sixDigitCode = await extractor.getVerificationCode();
            
            // Clean up emails
            const cleaner = new EmailCleaner(imapConfig);
            await cleaner.cleanupAllEmails();
            
            return sixDigitCode;
        } catch (error) {
            console.error('Erro ao extrair código:', error);
            throw error;
        }
    }
}





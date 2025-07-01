import Imap from 'imap';

export class EmailCleaner {
    constructor(imapConfig) {
        this.imap = new Imap(imapConfig);
    }

    async cleanupAllEmails() {
        await this.connectImap();
        const folders = [
            'INBOX', 
            '[Gmail]/Todos os e-mails'
        ];
        
        for (const folder of folders) {
            try {
                await this.cleanFolder(folder);
            } catch (error) {
                console.log(`Erro ao limpar pasta ${folder}`);
            }
        }

        await this.emptyTrash();
        this.imap.end();
    }

    connectImap() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', resolve);
            this.imap.once('error', reject);
            this.imap.connect();
        });
    }

    async cleanFolder(folder) {
        return new Promise((resolve, reject) => {
            this.imap.openBox(folder, false, async (err) => {
                if (err) {
                    resolve();
                    return;
                }

                try {
                    const results = await this.searchEmails();
                    if (results && results.length) {
                        this.imap.move(results, '[Gmail]/Lixeira', (err) => {
                            if (err) {
                                console.log(`Erro ao mover emails da pasta ${folder}:`, err);
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    emptyTrash() {
        return new Promise((resolve, reject) => {
            this.imap.openBox('[Gmail]/Lixeira', false, (err) => {
                if (err) {
                    resolve();
                    return;
                }

                this.imap.search(['ALL'], (err, results) => {
                    if (err || !results.length) {
                        resolve();
                        return;
                    }

                    const fetch = this.imap.seq.fetch(results, { bodies: '' });
                    fetch.on('message', (msg) => {
                        msg.on('attributes', (attrs) => {
                            const uid = attrs.uid;
                            this.imap.addFlags(uid, '\\Deleted', (err) => {
                                if (err) console.log('Erro ao marcar email para exclusão:', err);
                            });
                        });
                    });

                    fetch.once('end', () => {
                        this.imap.expunge(() => resolve());
                    });
                });
            });
        });
    }

    searchEmails() {
        return new Promise((resolve, reject) => {
            this.imap.search(['ALL'], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });
    }
}
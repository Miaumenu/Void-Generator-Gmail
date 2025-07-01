import clipboardy from 'clipboardy';

/**
 * Cola um valor em um campo de formulário usando clipboard ou fallback
 * @param {Page} page - Instância da página Puppeteer
 * @param {string} selector - Seletor CSS do campo
 * @param {string} value - Valor a ser colado
 * @throws {Error} Se falhar ao colar ou campo permanecer vazio
 */
export const pasteField = async (page, selector, value) => {
    try {
        // Tenta método com clipboard (Ctrl+V)
        try {
            await clipboardy.write(value);
            await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await page.click(selector);
            await page.evaluate(() => new Promise(r => setTimeout(r, 500))); // Pequeno delay para garantir foco
            
            // Simula Ctrl+A (selecionar tudo) e Ctrl+V (colar)
            await page.keyboard.down('Control');
            await page.keyboard.press('a');
            await page.keyboard.up('Control');
            await page.keyboard.down('Control');
            await page.keyboard.press('v');
            await page.keyboard.up('Control');
        } catch (clipError) {
            // Fallback: digitação direta se clipboard falhar
            console.log('Usando fallback de digitação');
            await page.waitForSelector(selector, { visible: true, timeout: 5000 });
            await page.click(selector);
            await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
            await page.type(selector, value, { delay: 50 }); // Digita com pequeno delay entre teclas
        }

        // Validação: verifica se o valor foi inserido
        const inputValue = await page.$eval(selector, el => el.value);
        if (!inputValue) throw new Error('Falha na validação: campo permaneceu vazio');
    } catch (e) { 
        console.error('Erro na ação de colar:', e);
        throw e;
    }
};
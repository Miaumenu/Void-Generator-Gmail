/**
 * Gera atraso aleatório dentro de um range
 * @param {Page} page - Instância do Puppeteer
 * @param {[number, number]} delayRange - Array [min, max] em ms
 */
export const randomDelay = async (page, delayRange) => {
    const delay = Math.floor(Math.random() * (delayRange[1] - delayRange[0])) + delayRange[0];
    await page.waitForTimeout(delay);
};

/**
 * Clica em botões comuns (cookie, popups)
 * @param {Page} page - Instância do Puppeteer
 */
export const dismissPopups = async (page) => {
    const BUTTON_TEXTS = ['Got it', 'Accept', 'OK', 'Continue'];
    const BUTTON_SELECTORS = ['#ackButton', '.btn-confirm', '[data-testid="close-btn"]'];

    try {
        // Tenta por texto do botão
        for (const text of BUTTON_TEXTS) {
            const buttons = await page.$x(`//button[contains(., '${text}')]`);
            if (buttons.length > 0) {
                await buttons[0].click();
                await randomDelay(page, [300, 800]);
                break;
            }
        }

        // Tenta por seletores conhecidos
        for (const selector of BUTTON_SELECTORS) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                await randomDelay(page, [300, 500]);
            } catch (e) {
                continue;
            }
        }
    } catch (e) {
        console.warn('Nenhum popup encontrado para dispensar');
    }
};

/**
 * Valida se elemento está no viewport
 * @param {Page} page - Instância do Puppeteer
 * @param {ElementHandle} element - Elemento a ser verificado
 */
export const isInViewport = async (page, element) => {
    return await page.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }, element);
};
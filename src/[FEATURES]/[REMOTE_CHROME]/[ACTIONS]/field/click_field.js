/**
 * Clica em um elemento com tratamento robusto
 * @param {Page} page - Instância do Puppeteer
 * @param {string} selector - Seletor CSS/XPath
 * @param {[number, number]} delay - Range de delay aleatório [min, max] em ms
 */
export const clickElement = async (page, selector, delay = [0, 0]) => {
    try {
        // Aplica delay inicial se especificado
        if (delay[1]) {
            const randomDelay = Math.random() * (delay[1] - delay[0]) + delay[0];
            await page.waitForTimeout(randomDelay);
        }
        
        // Espera pelo elemento na página principal ou iframes
        await page.waitForSelector(selector, { visible: true, timeout: 30000 });
        const element = await findElementInFrames(page, selector);
        
        if (!element) throw new Error('Elemento não encontrado em nenhum frame');
        
        // Verifica visibilidade computada
        if (!(await isElementVisible(page, element))) {
            throw new Error('Elemento presente mas não visível');
        }
        
        // Executa o clique
        await element.focus();
        await element.click({ 
            delay: delay[0] === 0 ? 0 : 100 // Delay pós-clique
        });
    } catch (e) {
        console.error(`Falha ao clicar em ${selector}:`, e);
        throw e;
    }
};

/**
 * Preenche campo com tratamento especial para valores dinâmicos
 * @param {Page} page - Instância do Puppeteer
 * @param {string} selector - Seletor do campo
 * @param {string|object} value - Valor literal ou template para geração
 * @param {[number, number]} typingDelay - Atraso entre teclas [min, max]
 */
export const typeField = async (page, selector, value, typingDelay = [0, 0]) => {
    try {
        await page.waitForSelector(selector, { visible: true });
        
        // Gera valor dinâmico se necessário
        const finalValue = typeof value === 'object' 
            ? await generateDynamicValue(page, value) 
            : value;
        
        // Limpa campo antes de digitar
        await page.evaluate(s => document.querySelector(s).value = '', selector);
        
        // Digitação com ou sem delay
        if (!typingDelay[0]) {
            await page.type(selector, finalValue);
        } else {
            await typeWithRandomDelay(page, selector, finalValue, typingDelay);
        }
    } catch (e) { 
        throw new Error(`Falha ao digitar em ${selector}: ${e.message}`);
    }
};

// ========== FUNÇÕES INTERNAS ========== //

/** Busca elemento em todos os frames da página */
async function findElementInFrames(page, selector) {
    let element = await page.$(selector);
    if (!element) {
        for (const frame of page.frames()) {
            element = await frame.$(selector).catch(() => null);
            if (element) return element;
        }
    }
    return element;
}

/** Verifica visibilidade via CSS computado */
async function isElementVisible(page, element) {
    return await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style && 
               style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 &&
               el.offsetHeight > 0;
    }, element);
}

/** Digitação com delay aleatório entre teclas */
async function typeWithRandomDelay(page, selector, text, delayRange) {
    for (const char of text) {
        await page.type(selector, char, { 
            delay: Math.random() * delayRange[1] + delayRange[0] 
        });
    }
}
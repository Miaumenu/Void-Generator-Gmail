/**
 * Navega para uma URL com espera por carregamento completo
 * @param {Page} page - Instância do Puppeteer
 * @param {string} url - URL de destino
 * @param {object} options - Opções adicionais de navegação
 */
export const navigateTo = async (page, url, options = {}) => {
    try {
        await page.goto(url, { 
            waitUntil: 'networkidle2', // Espera por inatividade de rede
            timeout: 30000, // 30 segundos máximo
            ...options 
        });
    } catch (e) {
        throw new NavigationError(`Navegação falhou: ${url}`, { cause: e });
    }
};

/**
 * Espera por navegação para URL específica
 * @param {Page} page - Instância do Puppeteer
 * @param {string|RegExp} url - URL ou padrão regex para esperar
 */
export const waitForPage = async (page, url) => {
    try {
        await page.waitForNavigation({ 
            url, 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
    } catch (e) {
        throw new NavigationError(`Timeout aguardando: ${url}`, { cause: e });
    }
};

/**
 * Espera por seletor estar visível e estável
 * @param {Page} page - Instância do Puppeteer
 * @param {string} selector - Seletor CSS/XPath
 * @param {object} options - Opções adicionais de espera
 */
export const waitForSelector = async (page, selector, options = {}) => {
    try {
        await page.waitForSelector(selector, { 
            visible: true,
            timeout: 30000,
            ...options 
        });
    } catch (e) {
        throw new Error(`Elemento não apareceu: ${selector}`);
    }
};

/**
 * Rola a página para baixo (1 viewport)
 */
export const scrollDown = async (page) => {
    await page.evaluate(() => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
};

// Erro customizado para falhas de navegação
class NavigationError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'NavigationError';
    }
}
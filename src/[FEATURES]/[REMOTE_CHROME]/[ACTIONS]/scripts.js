import { pathToFileURL } from 'url';
import { resolve } from 'path';

/**
 * Executa script externo e gerencia credenciais
 * @param {Page} page - Instância do Puppeteer
 * @param {object} config - Configuração do script
 * @param {string} config.scriptPath - Caminho do script
 * @param {object} credentials - Credenciais atualizáveis
 * @returns {Promise<any>} Retorno do script executado
 */
export const executeScript = async (page, config, credentials) => {
    if (!config?.scriptPath) {
        throw new Error('Parâmetro scriptPath é obrigatório');
    }

    try {
        // Resolve caminho absoluto e converte para URL
        const absolutePath = resolve(config.scriptPath);
        const moduleUrl = pathToFileURL(absolutePath).href;
        
        // Importa dinamicamente o módulo
        const module = await import(moduleUrl);
        
        // Prepara parâmetro de código se necessário
        const codeParam = config.params?.code 
            ? credentials[config.params.code] 
            : null;
        
        // Executa a função principal do script
        const result = await module.default(page, codeParam);
        
        // Atualiza credenciais se retornado pelo script
        if (result) {
            if (result.code) credentials.twoFACode = result.code;
            if (result.secretKey) credentials.secretKey = result.secretKey;
        }
        
        return result;
    } catch (e) {
        console.error('Erro na execução de script:', {
            script: config.scriptPath,
            error: e.message
        });
        throw e;
    }
};
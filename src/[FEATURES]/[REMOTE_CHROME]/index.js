/**
 * SISTEMA DE AUTOMAÇÃO WEB - EXECUTOR DE PROCESSOS
 * 
 * Este módulo é responsável por executar sequências automatizadas de ações em páginas web,
 * funcionando como um orquestrador que lê configurações JSON e executa ações correspondentes
 * no navegador através de Puppeteer ou similar.
 * 
 * FUNCIONALIDADES PRINCIPAIS:
 * - Lê arquivos JSON contendo sequências de ações web
 * - Executa ações como navegação, cliques, digitação, scrolling
 * - Gerencia credenciais e dados dinâmicos
 * - Sistema de logging integrado para monitoramento
 * - Controle de timing e delays entre ações
 * - Tratamento de erros robusto
 * 
 * AÇÕES SUPORTADAS:
 * - navegar: Navega para URLs específicas
 * - clicar: Clica em elementos via seletores CSS
 * - escrever: Digita texto em campos de formulário
 * - colar: Cola conteúdo em campos específicos
 * - tecla: Pressiona teclas específicas (Enter, Tab, etc)
 * - scrollBaixo: Rola a página para baixo
 * - setaBaixo: Pressiona seta para baixo múltiplas vezes
 * - aguardar: Aguarda elementos aparecerem na página
 * - aguardarSite: Aguarda carregamento completo do site
 * - script: Executa JavaScript personalizado na página
 * - clicarBotoes: Clica em múltiplos botões automaticamente
 * 
 * ESTRUTURA DO JSON DE AÇÕES:
 * {
 *   "actions": [
 *     {
 *       "acao": "navegar",
 *       "url": "https://exemplo.com",
 *       "logging": { "level": "info", "mensagem": "Navegando para site" },
 *       "tempoDestaAcaoIniciar": [1000]
 *     }
 *   ]
 * }
 */

import { 
    navegarPagina, 
    colarCampo, 
    clicarElemento, 
    escreverCampo, 
    pressionarTecla, 
    moverScrollBaixo, 
    executarScript,
    pressionarSetaBaixo,
    aguardarSite,
    aguardarSeletor,
    clicarBotoes 
} from './actions.js';

import { setupLogger } from '../logger/logger.js';
import fs from 'fs/promises';


/**
 * Mapeamento de ações disponíveis para automação web
 * Cada ação corresponde a uma função específica de interação com o navegador
 */
const actions = {
    navegar: (pagina, {url}) => navegarPagina(pagina, url),
    clicar: (pagina, {seletor}) => clicarElemento(pagina, seletor),
    tecla: (pagina, {tecla}) => pressionarTecla(pagina, tecla),
    scrollBaixo: (pagina) => moverScrollBaixo(pagina),
    aguardar: (pagina, {seletor}) => aguardarSeletor(pagina, seletor),
    script: (pagina, config, credenciais, logger) => executarScript(pagina, config, credenciais, logger),
    setaBaixo: (pagina, {QtdClicks}) => pressionarSetaBaixo(pagina, QtdClicks[0]),
    aguardarSite: (pagina, {url}) => aguardarSite(pagina, url),
    escrever: (pagina, {seletor, valor}) => escreverCampo(pagina, seletor, valor),
    colar: (pagina, {seletor, valor}) => colarCampo(pagina, seletor, valor),
    clicarBotoes: (pagina) => clicarBotoes(pagina)
};

/**
 * Executa uma sequência de ações automatizadas em uma página web
 * 
 * @param {string} actionPath - Caminho para o arquivo JSON contendo as ações
 * @param {Object} pagina - Instância da página do navegador (Puppeteer Page)
 * @param {Object} credenciais - Dados de credenciais e configurações do usuário
 * 
 * FLUXO DE EXECUÇÃO:
 * 1. Configura sistema de logging
 * 2. Lê e parseia o arquivo JSON de ações
 * 3. Itera através de cada ação sequencialmente
 * 4. Para cada ação:
 *    - Registra logs se configurado
 *    - Aplica delay se especificado
 *    - Executa a ação correspondente
 *    - Trata erros individuais
 * 5. Propaga erros críticos para níveis superiores
 */
export async function executarProcesso(actionPath, pagina, credenciais) {
    const logger = await setupLogger();
    
    try {
        // Carrega e parseia o arquivo de configuração de ações
        const {actions: acoes} = JSON.parse(await fs.readFile(actionPath, 'utf-8'));
        
        // Executa cada ação sequencialmente
        for (const acao of acoes) {
            // Sistema de logging condicional por ação
            if (acao.logging?.level) {
                logger[acao.logging.level](acao.logging.mensagem);
            }
            
            // Delay configurável antes da execução da ação
            if (acao.tempoDestaAcaoIniciar?.[0]) {
                await new Promise(resolve => setTimeout(resolve, acao.tempoDestaAcaoIniciar[0]));
            }
            
            try {
                // Executa a ação ou registra aviso para ações desconhecidas
                const acaoFuncao = actions[acao.acao];
                if (acaoFuncao) {
                    await acaoFuncao(pagina, acao, credenciais, logger);
                } else {
                    logger.warning(`Ação desconhecida: ${acao.acao}`);
                }
            } catch (erro) {
                logger.error(`Falha na execução da ação ${acao.acao}: ${erro.message}`);
                throw erro;
            }
        }
        
        logger.info(`Processo ${actionPath} executado com sucesso`);
        
    } catch (erro) {
        logger.critical(`Erro fatal na execução do processo ${actionPath}: ${erro.message}`);
        throw erro;
    }
}
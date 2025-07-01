// Importações com caminhos corrigidos baseados na sua estrutura de projeto
import { executarProcesso } from './src/[FEATURES]/[REMOTE_CHROME]/index.js';

// Supondo que as funções abaixo existam nos caminhos indicados pela estrutura

/**
 * Função principal que orquestra todo o processo de criação de conta.
 */
async function main() {
    
        await executarProcesso('src/[AUTOMATION]/REGISTER/register.json', page, credenciais);
        

}

// Chama a função main para iniciar todo o processo
main();
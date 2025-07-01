/**
 * Gerador de Nome de Usuário - Versão Compacta
 * Gera nomes únicos de 16 caracteres e salva em src/data/history.json
 */

const fs = require('fs');
const path = require('path');

// Caracteres permitidos
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Caminho fixo para o arquivo
function getHistoryPath() {
  const dataDir = path.join('src', '[DATA]'); // src/data
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true }); // Cria apenas src/data
  }
  return path.join(dataDir, 'history.json'); // src/data/history.json
}

// Restante do código permanece EXATAMENTE igual
function loadExistingNames(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return new Set(JSON.parse(fs.readFileSync(filePath, 'utf8')));
    }
  } catch (e) {}
  return new Set();
}

function generateRandomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

function insertCharAt(str, char) {
  const pos = Math.floor(Math.random() * (str.length + 1));
  return str.slice(0, pos) + char + str.slice(pos);
}

function generateUniqueUsername(existingNames) {
  for (let attempts = 0; attempts < 5000; attempts++) {
    let username = insertCharAt(insertCharAt(generateRandomString(14), '_'), '-').slice(0, 16);
    if (!existingNames.has(username)) return username;
  }
  throw new Error("Não foi possível gerar nome único");
}

function saveToHistory(filePath, existingNames, newName) {
  existingNames.add(newName);
  fs.writeFileSync(filePath, JSON.stringify([...existingNames].sort(), null, 2));
}

// Função principal
function main() {
  try {
    const historyPath = getHistoryPath();
    const existingNames = loadExistingNames(historyPath);
    const username = generateUniqueUsername(existingNames);
    
    saveToHistory(historyPath, existingNames, username);
    console.log(username);
    
    return [{ json: { Nome: username } }];
  } catch (error) {
    return [{ json: { Erro: error.message } }];
  }
}

return main();
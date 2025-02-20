const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const http = require('http'); // Importe o módulo http
const WebSocket = require('ws');

const server = http.createServer(app); // Crie um servidor HTTP
const wss = new WebSocket.Server({ server }); // Use o servidor HTTP para o WebSocket

// Configuração do WebSocket
wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log(`Mensagem recebida: ${message}`);
    ws.send(`Você disse: ${message}`);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Inicia o servidor HTTP e WebSocket
const port = 3000;
server.listen(port, () => {
  console.log(`Servidor rodando em https://meu-backend-xtd4.onrender.com`);
});

// Configuração do CORS
app.use(cors({
  origin: 'https://sitexadrezifcedson.surge.sh', // URL do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  credentials: true // Permite cookies/tokens (se necessário)
}));

// Middleware para dados JSON
app.use(express.json());

// Caminho para o arquivo JSON
const dbPath = path.join(__dirname, 'database.json');

// Função para ler o arquivo JSON
function readDatabase() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

// Função para escrever no arquivo JSON
function writeDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Rota para cadastro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();

  // Verifica se o usuário já existe
  const userExists = db.users.some(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  // Adiciona o novo usuário
  db.users.push({ username, password });
  writeDatabase(db);

  console.log('Usuário cadastrado com sucesso:', username);
  res.status(201).json({ message: 'Cadastro realizado!' });
});

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();

  // Verifica se o usuário existe e a senha está correta
  const user = db.users.find(user => user.username === username && user.password === password);
  if (user) {
    res.status(200).json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Inicia o servidor HTTP
app.listen(port, () => {
  console.log(`Servidor rodando em https://meu-backend-xtd4.onrender.com`);
});

app.get('/mensagem', (req, res) => {
  res.json({ message: 'Olá, frontend!' });
});
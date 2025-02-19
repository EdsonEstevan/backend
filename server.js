const express = require('express');
const Database = require('better-sqlite3');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do SQLite
const db = new Database('database.db');

// Cria a tabela de usuários se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`).run();

// Middleware para permitir CORS e JSON
app.use(cors());
app.use(express.json());

// Rota para cadastro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);
    res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(400).json({ error: 'Usuário já existe' });
  }
});

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.status(200).json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ error: 'Usuário ou senha incorretos' });
  }
});

// Inicia o servidor HTTP
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Configuração do WebSocket
const wss = new WebSocket.Server({ server });

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
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Importação correta do sqlite3
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do SQLite
const db = new sqlite3.Database('database.db'); // Criação do banco de dados

// Cria a tabela de usuários se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});

// Middleware para permitir CORS e JSON
app.use(cors());
app.use(express.json());

// Rota para cadastro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, password, function (err) {
    if (err) {
      res.status(400).json({ error: 'Usuário já existe' });
    } else {
      res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    }
  });
  stmt.finalize();
});

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
      res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }
  });
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
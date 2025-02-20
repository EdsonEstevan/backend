const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Configuração do CORS
app.use(cors({
  origin: 'http://sitexadrezifcedson.surge.sh', // URL do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  credentials: true // Permite cookies/tokens (se necessário)
}));

// Middleware para dados JSON
app.use(express.json());

// Configuração do banco de dados
const db = new sqlite3.Database('database.db');

// Cria a tabela de usuários
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});

// Rota para cadastro
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, password, function (err) {
    if (err) {
      console.error('Erro ao cadastrar usuário:', err);
      res.status(400).json({ error: 'Usuário já existe' });
    } else {
      console.log('Usuário cadastrado com sucesso:', username);
      res.status(201).json({ message: 'Cadastro realizado!' });
    }
  });
  stmt.finalize();
  db.run('COMMIT'); // Força a persistência dos dados
});

// Rota para login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});

// Inicia o servidor HTTP
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://meu-backend-xtd4.onrender.com`);
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
process.on('SIGINT', () => {
  db.close(); // Fecha o banco de dados ao encerrar o servidor
  process.exit();
});
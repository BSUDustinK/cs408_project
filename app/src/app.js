const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const db = require('./bin/db');

const fs = require('fs');
const path = require('path');

const http = require('http');
const { WebSocketServer } = require('ws');
const PORT = 3000;

const index = require('./routes/index');

const app = express();

//Ensure the data directory exists
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dbFileName = process.env.DB_NAME || 'database.sqlite';
const dbPath = path.join(dataDir, dbFileName);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const databaseManager = db.createDatabaseManager(dbPath);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.use(expressLayouts); //Styles the index page

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
// Static files in public directory images, css, js, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Static html files in the static directory
// This is for static files that are not using a template engine
app.use(express.static(path.join(__dirname, 'static')));

// Middleware to attach database to request
app.use((request, response, next) => {
  request.db = databaseManager.dbHelpers;
  next();
});
app.use('/', index);

module.exports = app;


// Code for Websocket Support
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const clients = new Set();

wss.on('connection', (ws, req) => {
  const id = req.socket.remoteAddress + ':' + req.socket.remotePort;
  clients.add(ws);
  console.log(`[+] Client connected: ${id} (total: ${clients.size})`);

  ws.on('hostjoin', (raw) => {
    const msg = raw.toString();
    console.log(`[msg] ${id}: ${msg}`);
    // Broadcast to all other clients
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(`${id}: ${msg}`);
      }
    }
    // Echo back to sender
    ws.send(`you: ${msg}`);
  });

  ws.on('playerjoin', (raw) => {
    const msg = raw.toString();
    console.log(`[msg] ${id}: ${msg}`);
    // Broadcast to all other clients
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(`${id}: ${msg}`);
      }
    }
    // Echo back to sender
    ws.send(`you: ${msg}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[-] Client disconnected: ${id} (total: ${clients.size})`);
  });
  ws.send('Connected to WebSocket server');
});
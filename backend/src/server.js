require('dotenv').config();
const http = require('http');
const { MongoClient } = require('mongodb');
const { route } = require('./router');
const { json } = require('./utils/response');

const port = process.env.PORT || 3000;
let secret;
let client;
let db;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

async function start() {
  require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
  });

  secret = process.env.JWT_SECRET;

  if (!process.env.MONGODB_URI || !secret) {
    throw new Error('Add MONGODB_URI and JWT_SECRET to backend/.env.');
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  db = client.db();

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('favorites').createIndex(
    { userId: 1, productId: 1 },
    { unique: true }
  );
  await db.collection('history').createIndex(
    { userId: 1, query: 1 },
    { unique: true }
  );

  http.createServer((req, res) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    route(req, res, db).catch(error => {
      console.error(error);
      if (!res.headersSent) {
        json(res, 500, { error: 'Something went wrong.' });
      }
    });
  }).listen(port, () => {
    console.log(`ShopWise API listening on port ${port}`);
  });
}

start().catch(error => {
  console.error(error.message);
  process.exit(1);
});
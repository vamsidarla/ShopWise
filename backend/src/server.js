require('dotenv').config();

const http = require('http');
const path = require('path');
const { MongoClient } = require('mongodb');
const { route } = require('./router');
const { json } = require('./utils/response');

const port = process.env.PORT || 3000;

let client;
let db;

async function start() {
  // Load backend/.env for local development
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
  });

  const secret = process.env.JWT_SECRET;

  if (!process.env.MONGODB_URI || !secret) {
    throw new Error(
      'Add MONGODB_URI and JWT_SECRET to backend/.env.'
    );
  }

  // Support either environment-variable name
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN
  ]
    .filter(Boolean)
    .flatMap(value => value.split(','))
    .map(value => value.trim().replace(/\/+$/, ''));

  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://localhost:4173',
    ...configuredOrigins
  ]);

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  db = client.db();

  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true }
  );

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

    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, DELETE, OPTIONS'
    );

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    route(req, res, db).catch(error => {
      console.error(error);

      if (!res.headersSent) {
        json(res, 500, {
          error: 'Something went wrong.'
        });
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
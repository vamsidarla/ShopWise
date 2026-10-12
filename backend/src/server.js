require('dotenv').config();
const http = require('http');
const { MongoClient } = require('mongodb');
const { route } = require('./router');
const { json } = require('./utils/response');

const port = process.env.PORT || 3000;
let secret;
let client;
let db;

async function start() { 
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
  secret = process.env.JWT_SECRET;
  
  if (!process.env.MONGODB_URI || !secret) {
    throw new Error('Add MONGODB_URI and JWT_SECRET to backend/.env.'); 
  }
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect(); 
  db = client.db(); 
  await db.collection('users').createIndex({ email: 1 }, { unique: true }); 
  await db.collection('favorites').createIndex({ userId: 1, productId: 1 }, { unique: true }); 
  await db.collection('history').createIndex({ userId: 1, query: 1 }, { unique: true }); 
  
  http.createServer((req, res) => {
    route(req, res, db).catch(error => { 
      console.error(error); 
      json(res, 500, { error: 'Something went wrong.' }); 
    });
  }).listen(port, () => console.log(`ShopWise API listening on http://localhost:${port}`)); 
}

start().catch(error => { 
  console.error(error.message); 
  process.exit(1); 
});

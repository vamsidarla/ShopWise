const { json } = require('./utils/response');
const authController = require('./controllers/authController');
const { handleFavorites } = require('./controllers/favoritesController');
const { handleHistory } = require('./controllers/historyController');
const searchController = require('./controllers/searchController');

async function route(req, res, db) {
  const url = new URL(req.url, `http://${req.headers.host}`); 
  
  if (req.method === 'OPTIONS') return json(res, 204, {}); 
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true }); 
  
  if (req.method === 'GET' && url.pathname === '/api/search') {
    return await searchController.search(req, res, url);
  }
  
  if (req.method === 'POST' && url.pathname === '/api/auth/register') { 
    return await authController.register(req, res, db);
  }
  
  if (req.method === 'POST' && url.pathname === '/api/auth/login') { 
    return await authController.login(req, res, db);
  }
  
  if (url.pathname === '/api/favorites') { 
    return await handleFavorites(req, res, db);
  }
  
  if (url.pathname === '/api/history') {
    return await handleHistory(req, res, db);
  }
  
  return json(res, 404, { error: 'Not found' });
}

module.exports = { route };

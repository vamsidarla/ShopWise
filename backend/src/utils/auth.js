const jwt = require('jsonwebtoken');

function getSession(req) { 
  try { 
    return jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); 
  } catch { 
    return null; 
  } 
}

module.exports = { getSession };

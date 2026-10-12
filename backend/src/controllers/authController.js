const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { json, parseBody } = require('../utils/response');

async function register(req, res, db) {
  const { name, email, password } = await parseBody(req); 
  if (!name || !email || !password || password.length < 8) {
    return json(res, 400, { error: 'Name, email, and an 8+ character password are required.' }); 
  }
  if (await db.collection('users').findOne({ email: email.toLowerCase() })) {
    return json(res, 409, { error: 'An account already exists for this email.' }); 
  }
  const user = { 
    name, 
    email: email.toLowerCase(), 
    passwordHash: await bcrypt.hash(password, 12), 
    createdAt: new Date() 
  };
  const inserted = await db.collection('users').insertOne(user);
  const token = jwt.sign({ sub: inserted.insertedId.toString(), name }, process.env.JWT_SECRET, { expiresIn: '7d' }); 
  return json(res, 201, { token, user: { id: inserted.insertedId, name, email: user.email } });
}

async function login(req, res, db) {
  const { email, password } = await parseBody(req);
  const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() }); 
  if (!user || !await bcrypt.compare(password || '', user.passwordHash)) {
    return json(res, 401, { error: 'Invalid email or password.' }); 
  }
  return json(res, 200, { 
    token: jwt.sign({ sub: user._id.toString(), name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' }), 
    user: { id: user._id, name: user.name, email: user.email } 
  });
}

module.exports = { register, login };

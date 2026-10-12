const { ObjectId } = require('mongodb');
const { json, parseBody } = require('../utils/response');
const { getSession } = require('../utils/auth');

async function handleHistory(req, res, db) {
  const user = getSession(req); 
  if (!user) return json(res, 401, { error: 'Sign in required.' }); 
  
  const history = db.collection('history'); 
  
  if (req.method === 'GET') {
    return json(res, 200, await history.find({ userId: new ObjectId(user.sub) }).sort({ searchedAt: -1 }).toArray()); 
  }
  
  if (req.method === 'POST') { 
    const { query } = await parseBody(req); 
    if (!query) return json(res, 400, { error: 'Query is required.' }); 
    await history.updateOne(
      { userId: new ObjectId(user.sub), query: String(query).toLowerCase() }, 
      { $set: { query: String(query).toLowerCase(), userId: new ObjectId(user.sub), searchedAt: new Date() } }, 
      { upsert: true }
    ); 
    return json(res, 201, { ok: true }); 
  }
  
  if (req.method === 'DELETE') { 
    const { query } = await parseBody(req); 
    if (query) { 
      await history.deleteOne({ userId: new ObjectId(user.sub), query: String(query).toLowerCase() }); 
    } else { 
      await history.deleteMany({ userId: new ObjectId(user.sub) }); 
    } 
    return json(res, 200, { ok: true }); 
  }
}

module.exports = { handleHistory };

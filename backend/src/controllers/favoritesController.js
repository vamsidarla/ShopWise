const { ObjectId } = require('mongodb');
const { json, parseBody } = require('../utils/response');
const { getSession } = require('../utils/auth');

async function handleFavorites(req, res, db) {
  const user = getSession(req); 
  if (!user) return json(res, 401, { error: 'Sign in required.' }); 
  
  const favorites = db.collection('favorites'); 
  
  if (req.method === 'GET') {
    return json(res, 200, await favorites.find({ userId: new ObjectId(user.sub) }).sort({ savedAt: -1 }).toArray()); 
  }
  
  if (req.method === 'POST') { 
    const product = await parseBody(req); 
    if (!product.id || !product.name) {
      return json(res, 400, { error: 'Product id and name are required.' }); 
    }
    await favorites.updateOne(
      { userId: new ObjectId(user.sub), productId: String(product.id) }, 
      { $set: { ...product, userId: new ObjectId(user.sub), productId: String(product.id), savedAt: new Date() } }, 
      { upsert: true }
    ); 
    return json(res, 201, { ok: true }); 
  }
  
  if (req.method === 'DELETE') { 
    const { productId } = await parseBody(req); 
    await favorites.deleteOne({ userId: new ObjectId(user.sub), productId: String(productId) }); 
    return json(res, 200, { ok: true }); 
  }
}

module.exports = { handleFavorites };

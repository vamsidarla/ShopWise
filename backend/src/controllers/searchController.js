const { json } = require('../utils/response');
const { searchProducts } = require('../utils/scrapers');

async function search(req, res, url) {
  const query = url.searchParams.get('q')?.trim(); 
  const minPrice = Number(url.searchParams.get('minPrice')) || 0;
  const maxPrice = Number(url.searchParams.get('maxPrice')) || 150000;
  const minRating = Number(url.searchParams.get('minRating')) || 0;
  
  if (!query || query.length > 120) {
    return json(res, 400, { error: 'Provide a product search between 1 and 120 characters.' }); 
  }
  return json(res, 200, await searchProducts(query, minPrice, maxPrice, minRating));
}

module.exports = { search };

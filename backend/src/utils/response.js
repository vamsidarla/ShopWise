const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  });

  res.end(JSON.stringify(data));
};

const parseBody = req => new Promise((resolve, reject) => {
  let raw = '';

  req.on('data', chunk => raw += chunk);

  req.on('end', () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch {
      reject(new Error('Invalid JSON'));
    }
  });
});

module.exports = { json, parseBody };
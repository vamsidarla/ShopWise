# ShopWise

A comparison-first shopping app for India. ShopWise searches Amazon India and Flipkart, ranks relevant listings, and helps people choose based on value—not only the lowest price.

## What it does

1. A shopper searches for a product.
2. The backend retrieves public Amazon India and Flipkart listings in parallel.
3. Product data is normalized, ranked, and returned with best-value, cheapest, and top-rated recommendations.
4. The React UI displays product cards, insight cards, and direct retailer links.

## Architecture

```text
React frontend (Vite, port 5173)
        │ search, filters, product and insight cards
        ▼
Node.js backend (port 3000)
        │ search, normalization, ranking, auth API
        ├── Amazon India public listings
        ├── Flipkart public listings
        └── MongoDB (users and saved favourites)
```

| Folder | Responsibility |
| --- | --- |
| `frontend/` | Vite + React comparison UI |
| `backend/` | Node API, MongoDB user/favorites data, and public-listing search adapters |

## Current capabilities

- Live Amazon and Flipkart search results
- Relevant-result ranking per store
- Price, platform, and rating filters
- Product images and direct retailer links
- Best-value, cheapest, and top-rated insight cards
- JWT authentication and MongoDB-ready favorites endpoints

## Run locally

You need **Node.js 18+** and a **MongoDB connection string** (a free MongoDB Atlas cluster works fine). Everything below is run from a terminal, from inside the `ShopWise` folder you unzipped.

### 1. Install dependencies

This project is an npm workspace, so one install covers both `frontend/` and `backend/`:

```bash
npm install
```

### 2. Get a MongoDB connection string

If you don't have one yet:

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. In Atlas, go to **Database → Connect → Drivers**, and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.<id>.mongodb.net/?appName=<name>
   ```
3. In Atlas, go to **Network Access → Add IP Address** and allow your current IP (or `0.0.0.0/0` for local testing).
4. In Atlas, go to **Database Access** and confirm the user/password in the string are correct.

Copy the string fresh from Atlas rather than retyping it — a single mistyped character in the cluster address is the most common cause of connection errors.

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```
MONGODB_URI=<paste your real connection string here>
JWT_SECRET=<any long random string, e.g. run: openssl rand -hex 32>
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

The default (`VITE_API_URL=http://localhost:3000`) already matches the backend port from step 3, so you usually don't need to change it.

### 5. Start both apps

From the repository root:

```bash
npm run dev
```

This starts the backend and frontend together.

- Frontend (the site you open in a browser): **http://localhost:5173**
- Backend API: **http://localhost:3000** — visit `http://localhost:3000/api/health` and you should see `{"ok": true}`.

### 6. Verify it's working

- If the terminal shows `ShopWise API listening on http://localhost:3000` with no errors, MongoDB connected successfully.
- If you see a `querySrv` or `ECONNREFUSED` error instead, it's almost always one of: wrong connection string, IP not whitelisted in Atlas, or a network/DNS issue (common on mobile hotspots) — double check steps 2–3 above.
- Open `http://localhost:5173`, search for a product, and confirm results load from Amazon/Flipkart.

### Running the two apps separately (optional)

If you'd rather run them in two terminals instead of one combined `npm run dev`:

```bash
# terminal 1
npm run dev --workspace=backend

# terminal 2
npm run dev --workspace=frontend
```

### Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Add MONGODB_URI and JWT_SECRET to backend/.env` | `.env` wasn't created or is empty | Repeat step 3 |
| `querySrv ECONNREFUSED ...mongodb.net` | Bad connection string, or DNS blocked on your network | Re-copy string from Atlas; try a different network/DNS (8.8.8.8) |
| Frontend loads but searches fail | Backend isn't running, or `VITE_API_URL` points to the wrong port | Confirm `http://localhost:3000/api/health` works |
| `MongoServerError: bad auth` | Wrong username/password in the connection string | Reset the database user's password in Atlas → Database Access |

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a user and return a seven-day JWT |
| POST | `/api/auth/login` | Sign in and return a JWT |
| GET | `/api/favorites` | Get a signed-in user's saved products |
| POST | `/api/favorites` | Save a product; use `Authorization: Bearer <token>` |
| DELETE | `/api/favorites` | Remove `{ "productId": "..." }` |

## Search integration

`GET /api/search?q=wireless+headphones` retrieves public Amazon India and Flipkart search pages in parallel and normalizes results to `{ id, name, price, original, rating, reviews, delivery, store, url, image }`. The scraper uses conservative timeouts and does not attempt to defeat CAPTCHAs, login requirements, or other anti-bot controls. Before production use, review each platform's terms and robots guidance; an official affiliate/product API is more durable than HTML parsing.

## Next milestones

1. Connect the favorites UI to the MongoDB API and add sign-in/sign-up screens.
2. Match the same product across retailers for side-by-side comparisons.
3. Add price history, price-drop alerts, and additional retailers.
4. Move to approved affiliate or product APIs for production reliability.

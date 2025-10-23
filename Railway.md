# Railway Deployment

1. Create a new Railway project and connect this repo.
2. Set Environment Variables:
   - NODE_ENV=production
   - SESSION_SECRET=replace-with-strong-secret
   - (Optional) MONGODB_URI and MONGODB_DB if using Mongo upserts
3. Build & Run:
   - Railway will run `npm install` which triggers `postinstall` to build client and server.
   - `Procfile` defines: `web: npm start`.
4. Persistent storage:
   - This app stores JSON under `/data`. Add a Railway Volume and mount it at `/data`.
5. PDFs (Puppeteer):
   - Railway Nixpacks provides Chromium; current Puppeteer launch flags work.

Health check: Access `/` after deploy; API under `/api/*`.

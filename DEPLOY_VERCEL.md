# 🚀 Deploying FitLife AI to Vercel

FitLife AI is fully configured and ready for 1-click deployment on **Vercel** with full-stack support (Vite React frontend + Node.js Serverless API + MySQL/Database engine).

---

## 📁 Pre-configured Files for Vercel
Your codebase already contains the required configuration:
- **`vercel.json`**: Handles URL rewrites, mapping `/api/*` to Serverless Functions and frontend URLs to Single Page Application routing.
- **`api/index.js`**: Serverless entry point for Express API routes.
- **`package.json`**: Pre-configured build script (`"build": "vite build"`).
- **`.gitignore`**: Excludes `node_modules`, local `.env`, and build caches.

---

## 🌟 Method 1: Deploy via GitHub (Recommended & Easiest)

This method provides continuous deployment—every time you push changes to GitHub, Vercel updates automatically.

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) and create a repository named `fitlife-ai`.
2. Keep it public or private.

### Step 2: Push your code to GitHub
Open your terminal in this project folder and run:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/fitlife-ai.git
git branch -M main
git push -u origin main
```

### Step 3: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in (or sign up with GitHub).
2. Click **"Add New..."** in the top right and select **"Project"**.
3. Under **Import Git Repository**, locate your `fitlife-ai` repository and click **"Import"**.
4. In the Project Configuration screen:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `vite build` (detected automatically)
   - **Output Directory**: `dist` (detected automatically)
5. Click **"Deploy"**.

Within 60 seconds, your site will be live with a free `https://fitlife-ai-xxx.vercel.app` URL!

---

## ⚡ Method 2: Deploy via Vercel CLI (Direct from Terminal)

You can also deploy directly from your command line without pushing to GitHub first:

1. Open PowerShell or Command Prompt in this folder:
   ```bash
   cd "C:\Users\HP\Downloads\ai smart fitness app"
   ```

2. Run the Vercel deploy command:
   ```bash
   npx vercel
   ```

3. Follow the one-time prompts:
   - **Log in**: Press Enter to open the browser and authorize Vercel.
   - **Set up and deploy?**: Press `Y`.
   - **Which scope?**: Select your account.
   - **Link to existing project?**: Press `N`.
   - **What's your project's name?**: Press Enter (`fitlife-ai`).
   - **In which directory is your code located?**: Press Enter (`./`).
   - **Want to modify settings?**: Press `N`.

4. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 🗄️ Setting Up MySQL Database on Vercel

### 💡 Why is this needed?
Your local MySQL server (`localhost:3306`) runs on your private computer. When Vercel runs in the cloud, it cannot reach your laptop's private `localhost`.

> **Note:** FitLife AI has a built-in **hybrid database fallback engine**. If no cloud database is specified, Vercel will seamlessly use the embedded dataset so your app **never crashes** and remains fully testable.

### To connect a live cloud MySQL database:
1. Create a free cloud MySQL database in 1 minute using any of these providers:
   - **[Aiven for MySQL](https://aiven.io/)** (Free tier)
   - **[Railway.app](https://railway.app/)** (One-click MySQL provision)
   - **[TiDB Cloud](https://tidbcloud.com/)** (Free Serverless MySQL)
   - **[Clever Cloud](https://www.clever-cloud.com/)** (Free MySQL addon)
2. Obtain your cloud database credentials:
   - Host (e.g. `mysql-xxx.aivencloud.com`)
   - Port (e.g. `3306` or `12345`)
   - User (e.g. `avnadmin` or `root`)
   - Password
   - Database name (e.g. `fitlife_ai_db`)
3. In your Vercel Project Dashboard:
   - Go to **Settings** → **Environment Variables**.
   - Add the following variables:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `your-db-host.com` | Cloud MySQL host address |
| `DB_USER` | `avnadmin` | MySQL username |
| `DB_PASSWORD` | `your-db-password` | MySQL password |
| `DB_NAME` | `fitlife_ai_db` | MySQL database name |
| `DB_PORT` | `3306` | MySQL port |
| `JWT_SECRET` | `fitlife-super-secret-jwt-key-2026` | Secret key for login sessions |
| `GEMINI_API_KEY` | *(Optional)* | For live Google Gemini AI Trainer replies |

4. Click **Redeploy** in Vercel. Your cloud MySQL database will be automatically initialized and synchronized!

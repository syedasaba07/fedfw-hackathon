# BidLux — React + Vite Online Auction System

A beginner-friendly Review 2 project built with React and Vite. It demonstrates Admin and User modules, signup/login using browser Local Storage, auction management, bidding, and a user bid-history dashboard.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder and open it in VS Code.
3. Open Terminal in the project folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Demo accounts

- Admin email: `admin@bidlux.com`
- Admin password: `admin123`

Create a normal user using the Sign Up form.

## GitHub

Create a new empty GitHub repository, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Create BidLux React Vite project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the repository URL shown by GitHub.

## Vercel deployment

1. Push the project to GitHub.
2. Sign in to Vercel using GitHub.
3. Choose **Add New → Project** and import the BidLux repository.
4. Framework preset: **Vite**.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Click **Deploy**.

You can also use the Vercel CLI from the project folder:

```bash
npm install
npm install -g vercel
vercel login
vercel
```

Follow the prompts and accept the detected Vite settings. Use `vercel --prod` for a production deployment.

## Important project note

This is an academic front-end demo. Local Storage is not secure authentication: user details and passwords are stored in the browser and can be changed by the user. Do not use real passwords or sensitive information. A real application needs a backend, secure password hashing, and server-side authorization.

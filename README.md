# Pebble Jar Starter

A simple React habit tracker starter app, ready to upload to GitHub and deploy on Netlify or Vercel.

## Features

- Monthly calendar view
- Click to complete habits for each day
- Add and remove habits
- Monthly completion percentage
- Data saved in browser local storage
- No login and no backend required

## How to run locally

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal.

## How to build

```bash
npm run build
```

## Deploy to Netlify

1. Create a GitHub repository.
2. Upload all files in this folder.
3. Go to Netlify and choose **Add new site** → **Import an existing project**.
4. Connect your GitHub repository.
5. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy.

## Deploy to Vercel

1. Create a GitHub repository.
2. Upload all files in this folder.
3. Go to Vercel and choose **Add New Project**.
4. Import your GitHub repository.
5. Vercel should auto-detect Vite.
6. Deploy.

## Suggested next improvements

- Add a language switch
- Add habit colors or icons
- Add streak calculation
- Add export/import backup
- Add mobile home-screen install support

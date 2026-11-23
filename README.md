# 2026_camp

This is the website of game "Monopoly" in NTUEE camp for high school student!

2022: By rayray2002, jerry1249756 and hackhaha1\
2023: By lin-1214\
2024: By trix0831\
2026: By kosu516, liftleaf1105, and ozone0107

## Portfolio demo

[Play the GitHub Pages demo](https://kosu516.github.io/camp_monopoly/)

The demo uses the camp's React interface with sample teams and browser-local
game state. Open the **Demo** menu to switch views, buy or upgrade land, trade
resources, run final accounting, or reset the sample data.

To preview locally, run `cd frontend && yarn install --frozen-lockfile`, then
`REACT_APP_DEMO=true yarn start`. For GitHub Pages, select **GitHub Actions** in
**Settings → Pages**. The **Publish portfolio demo** workflow builds the demo
when the frontend changes on `main` and can also be run manually.

## Development
### Install packages
```bash
yarn install-all
```

### Env Config
- Create `backend/.env` (git-ignored) with your MongoDB connection string:
```bash
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>/?appName=<app>
```

- Before any commits, add `backend/.env` into `.gitignore` to avoid pushing your own MongoDB connection string up to the origin and keep real credentials only in `backend/.env`.

### Backend
```bash
cd backend
yarn initdata
yarn server
```

### Frontend
```bash
cd frontend
yarn start
```

## Deployment
### Local
```bash
yarn build-frontend
yarn start
```

### Docker
#### Build and Run
```bash
docker compose up -d --build
```

Compose builds the web image locally; no application image is pushed to or
pulled from Docker Hub.

#### Init
```bash
bash scripts/initdb.sh
```

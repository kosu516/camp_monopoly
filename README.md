# 2026_camp

This is the website of game "Monopoly" in NTUEE camp for high school student!

2022: By rayray2002, jerry1249756 and hackhaha1\
2023: By lin-1214\
2024: By trix0831\
2026: By kosu516, liftleaf1105, and ozone0107

## Portfolio demo

[Play the GitHub Pages demo](https://kosu516.github.io/camp_monopoly/)

The static demo uses sample teams and properties to show purchases, upgrades,
resource exchange, and final accounting. It runs entirely in the browser.

To preview it locally, run `python3 -m http.server 4173 --directory demo` from
the repository root and open `http://localhost:4173`. For GitHub Pages, select
**GitHub Actions** in **Settings → Pages** and run **Publish portfolio demo**.
The workflow publishes just the `demo/` directory on pushes that change it on
`main`.

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

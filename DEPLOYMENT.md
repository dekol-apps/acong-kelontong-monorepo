# CI/CD + Docker Setup

This project now includes:
- Dockerfile for backend (`be/Dockerfile`)
- Dockerfile for frontend SSR (`fe/Dockerfile`)
- Docker Compose stack with MongoDB replica set (`docker-compose.yml`)
- CI workflow (`.github/workflows/ci.yml`)
- Deploy workflow for a laptop server over SSH (`.github/workflows/deploy-server.yml`)

## 1) Local Docker run

1. Copy env template:

```bash
cp .env.example .env
```

2. Edit `.env` values (at minimum `JWT_SECRET` SMTP values, `FE_DOMAIN`).

3. Start all services:

```bash
docker compose up -d --build
```

4. Access:
- Frontend: `https://ack.dekolapps.tech`
- Backend API: `https://api.dekolapps.tech/api`

## 2) Why replica set is included

Your backend uses MongoDB transactions; Mongo transactions require replica set mode.
The Compose stack launches 3 MongoDB containers and initializes replica set `rs0` automatically.

Default URI in `.env.example`:

```env
MONGO_URI=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/AcongKelontongLocal?replicaSet=rs0&retryWrites=true&w=majority
```

## 3) GitHub Actions CI

On push/PR, CI will:
- build backend
- build frontend
- build both Docker images as a validation step

## 4) GitHub Actions deploy to your laptop server

This repository intentionally splits GitHub Actions configuration into:
- **Repository Variables (`vars`)** for non-sensitive values
- **Repository Secrets (`secrets`)** for sensitive values

Set these **Repository Variables**:
- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_PORT` (optional, default `22`)
- `SERVER_DEPLOY_PATH` (example: `/opt/acong-kelontong-monorepo`)
- `SERVER_REPO_URL` (HTTPS/SSH git URL reachable by the server)
- `BE_PORT` (optional)
- `FE_PORT` (optional)
- `FE_DOMAIN`
- `SMTP_USER`
- `SMTP_HOST`
- `SMTP_PORT` (optional)

Set these **Repository Secrets**:
- `SERVER_SSH_KEY`
- `MONGO_URI`
- `JWT_SECRET`
- `SMTP_PASS`

When `main` / `master` is updated, deploy workflow will run automatically. This includes merges from PRs, direct pushes, and any other change that creates a push event on the branch.

When that deploy workflow runs, it will:
- SSH into your server
- pull latest code
- write `.env`
- run `docker-compose up -d --build --remove-orphans`

Manual run note:
- `workflow_dispatch` exposes `deployment_type` with options: `simple` or `regular`.
- Push-triggered deploy defaults to `simple`.

PR checks note:
- Pull requests run the `CI` workflow (`.github/workflows/ci.yml`) with 3 jobs only; they do not deploy to the server:
  - `Backend Build`
  - `Frontend Build`
  - `Docker Build Check`

## 5) Server prerequisites (one-time)

Install Docker + Compose plugin and Git on your laptop server.

Ubuntu example:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Then log out and log in again.

## 6) Notes

- If your repo is private, ensure `SERVER_REPO_URL` can be cloned from the server (deploy key or PAT).
- If you terminate TLS on reverse proxy (Nginx/Caddy), set `FE_DOMAIN` to your public frontend URL.
- For production hardening, consider enabling Mongo auth and adding firewall rules.
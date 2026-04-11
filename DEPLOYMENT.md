# Remove existing docker build if you want fresh
docker compose -f docker-compose.simple.yml down --remove-orphans || docker-compose -f docker-compose.simple.yml down --remove-orphans || true

# WARNING: Use Docker Compose version higher than 1 (Compose v2 required)

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
- run Compose up command for selected deployment type 
<!-- example (`docker-compose up -d --build --remove-orphans`) -->

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

### Compose command compatibility check

Run this once on server:

```bash
docker compose version || true
docker-compose version || true
```

- If `docker compose version` works, use `docker compose` (recommended).
- If only `docker-compose version` works, you are still on Compose v1.

### Pop!_OS fallback when `docker-compose-plugin` is unavailable

Some Pop!_OS repositories do not provide `docker-compose-plugin` package directly.
If `sudo apt install docker-compose-plugin` fails with `Unable to locate package`, install Compose v2 standalone plugin:

```bash
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
docker compose version
```

If needed for all users on server, install globally:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version
```

### Why this matters

Compose v1 (`docker-compose 1.29.2`) can fail container recreation on modern Docker images with errors like:

```text
KeyError: 'ContainerConfig'
```

When that happens, backend may disappear even though Mongo and FE are still up.

## 6) Notes

- If your repo is private, ensure `SERVER_REPO_URL` can be cloned from the server (deploy key or PAT).
- If you terminate TLS on reverse proxy (Nginx/Caddy), set `FE_DOMAIN` to your public frontend URL.
- For production hardening, consider enabling Mongo auth and adding firewall rules.

## 7) BE down quick recovery (x200)

If FE and Mongo are up but BE container is missing/down:

```bash
cd ~/Documents/repos/acong/acong-kelontong-monorepo
docker-compose -f docker-compose.simple.yml rm -sf be
docker-compose -f docker-compose.simple.yml up -d --no-deps --build be
docker-compose -f docker-compose.simple.yml ps
docker logs --tail=120 $(docker-compose -f docker-compose.simple.yml ps -q be)
curl -i http://localhost:3200/api
```

Expected result:
- BE shows `Up` in Compose status.
- Logs show Nest app start and seeder completion.
- API responds `HTTP/1.1 200 OK`.

Mongo replica-set health check (mongo 4.4 image uses `mongo` shell):

```bash
docker exec -it acong-mongo mongo --quiet --eval "rs.status().ok"
```

Expected result: `1`.

# Connect to database remotely
## 1) Make sure the server db exposed and bridge via ssh as 27018
remote-laptop:~$ ssh x200
heri@ssh.dekolapps.tech's password: 
Welcome to Pop!_OS 22.04 LTS (GNU/Linux 6.17.9-76061709-generic x86_64)

 * Homepage: https://pop.system76.com
 * Support:  https://support.system76.com

Last login: Sat Apr 11 09:38:08 2026 from ::1
heri@pop-os:~$ ss -tulnp | grep 27017
tcp   LISTEN 0      4096                             0.0.0.0:27017      0.0.0.0:*                                                
tcp   LISTEN 0      4096                                [::]:27017         [::]:*                                                
heri@pop-os:~$ ^C
heri@pop-os:~$ exit
logout
Connection to ssh.dekolapps.tech closed.
remote-laptop:~$ ssh -L 27018:localhost:27017 x200
heri@ssh.dekolapps.tech's password: 
Welcome to Pop!_OS 22.04 LTS (GNU/Linux 6.17.9-76061709-generic x86_64)

 * Homepage: https://pop.system76.com
 * Support:  https://support.system76.com

Last login: Sat Apr 11 11:20:27 2026 from ::1
heri@pop-os:~$ ss -tulnp | grep 27018
heri@pop-os:~$ 

## 2) Test if database accessible as 27018 port
greatdekol@greatdekol-ThinkPad-T440p:~$ ss -tulnp | grep 27018
tcp   LISTEN 0      128                             127.0.0.1:27018      0.0.0.0:*    users:(("ssh",pid=9209,fd=6))  
tcp   LISTEN 0      128                                 [::1]:27018         [::]:*    users:(("ssh",pid=9209,fd=3))  
greatdekol@greatdekol-ThinkPad-T440p:~$ mongosh mongodb://localhost:27018

## 3) Open mongo compas and create new connection
mongodb://localhost:27018/?directConnection=true
# DOCKER v2 or above is required!

# Command to remove existing docker build if you want to wipe everything first
## 1) Go to server and execute these
PROJECT="$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-')"
docker compose -f docker-compose.yml down --volumes --remove-orphans || true
docker ps -aq --filter "label=com.docker.compose.project=$PROJECT" | xargs -r docker rm -f
docker network ls -q --filter "label=com.docker.compose.project=$PROJECT" | xargs -r docker network rm
docker volume ls -q --filter "label=com.docker.compose.project=$PROJECT" | xargs -r docker volume rm
docker volume ls -q --filter "name=^${PROJECT}_" | xargs -r docker volume rm

## 2) VERIFY

docker ps -a --format '{{.Names}}' | grep -E "$PROJECT|acong" || echo "No repo containers"
docker volume ls --format '{{.Name}}' | grep -E "^${PROJECT}_" || echo "No repo volumes"
docker network ls --format '{{.Name}}' | grep -E "^${PROJECT}_" || echo "No repo networks"

# If you want a full machine wipe (not repo scooped) [BECAREFUL!]
docker system prune -a --volumes -f

# CI/CD + Docker Setup

This repository now uses one deployment path:

- [docker-compose.yml](docker-compose.yml) with a single MongoDB container running as replica set `rs0`
- [scripts/deploy-ci.sh](scripts/deploy-ci.sh) for deploy, health checks, and rollback
- [.github/workflows/ci.yml](.github/workflows/ci.yml) for build and deploy on the self-hosted runner

## Local run

1. Copy the env template:

```bash
cp .env.example .env
```

1. Update `.env` values, especially `JWT_SECRET`, SMTP values, and `FE_DOMAIN`.

1. Start the stack:

```bash
docker compose up -d --build
```

1. Access:

- Frontend: `https://ack.dekolapps.tech`
- Backend API: `https://api.dekolapps.tech/api`

## MongoDB topology

The app uses MongoDB transactions, so Mongo runs with replica set mode even though there is only one Mongo container.

Why one container is enough here:

- It satisfies transaction requirements.
- It keeps the local and CI/CD setup simple.
- It avoids extra moving parts that do not add real fault tolerance on a single-host runner.

The default URI is:

```env
MONGO_URI=mongodb://mongo:27017/AcongKelontongLocal?retryWrites=true&w=majority&replicaSet=rs0
```

## GitHub Actions

On push/PR, CI builds backend and frontend.

On push to `main` or `master`, the workflow also deploys on the self-hosted runner.

The workflow uses repository variables and secrets for runtime config:

- Variables: `BE_PORT`, `FE_PORT`, `FE_DOMAIN`, `FE_API_URL`, `SMTP_USER`, `SMTP_HOST`, `SMTP_PORT`
- Secrets: `MONGO_URI`, `JWT_SECRET`, `SMTP_PASS`

## Deployment behavior

When deploy runs, it will:

- build and push container images to GHCR when needed
- generate `.env` on the runner
- start the single compose stack
- run health checks and rollback to the previous images if startup fails

## Server prerequisites

Install Docker Engine, the Compose v2 plugin, and Git on the self-hosted runner machine.

The workflow does not support Compose v1 anymore.

## Recovery

If you need to restart the backend manually on the runner:

```bash
docker compose -f docker-compose.yml rm -sf be
docker compose -f docker-compose.yml up -d --no-deps --build be
docker compose -f docker-compose.yml ps
docker logs --tail=120 $(docker compose -f docker-compose.yml ps -q be)
```

Expected result:

- BE shows `Up` in Compose status.
- Logs show Nest app start and seeder completion.
- API responds `HTTP/1.1 200 OK`.


# Connect to database remotely (via ssh cloudflare tunnel)
## 1) Make sure the server db exposed
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

## 2) Forward and re-route x200 27017 to remote-laptop as 27018
remote-laptop:~$ ssh -L 27018:localhost:27017 x200
heri@ssh.dekolapps.tech's password: 
Welcome to Pop!_OS 22.04 LTS (GNU/Linux 6.17.9-76061709-generic x86_64)

 * Homepage: https://pop.system76.com
 * Support:  https://support.system76.com

Last login: Sat Apr 11 11:20:27 2026 from ::1
heri@pop-os:~$ ss -tulnp | grep 27018

## 3) Test if database accessible as 27018 port
greatdekol@greatdekol-ThinkPad-T440p:~$ ss -tulnp | grep 27018
tcp   LISTEN 0      128                             127.0.0.1:27018      0.0.0.0:*    users:(("ssh",pid=9209,fd=6))  
tcp   LISTEN 0      128                                 [::1]:27018         [::]:*    users:(("ssh",pid=9209,fd=3))  
greatdekol@greatdekol-ThinkPad-T440p:~$ mongosh mongodb://localhost:27018

## 3) Open mongo compas and create new connection (27018)
mongodb://localhost:27018/?directConnection=true
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

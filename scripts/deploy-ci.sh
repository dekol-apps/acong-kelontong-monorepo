#!/usr/bin/env bash

set -euo pipefail

echo "Runner host: $(hostname)"
echo "Runner user: $(whoami)"
echo "Working directory: $(pwd)"

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose (v2) is required on the self-hosted runner"
  exit 1
fi

: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${REGISTRY_PREFIX:?REGISTRY_PREFIX is required}"
: "${MONGO_URI_VALUE:?MONGO_URI is required}"
: "${JWT_SECRET_VALUE:?JWT_SECRET is required}"

require_value() {
  local name="$1"
  local value="${!name:-}"

  if [ -z "${value}" ]; then
    echo "${name} is required"
    exit 1
  fi
}

require_value FE_DOMAIN_VALUE
require_value BE_PORT_VALUE
require_value FE_PORT_VALUE
require_value SMTP_USER_VALUE
require_value SMTP_PASS_VALUE
require_value SMTP_HOST_VALUE
require_value SMTP_PORT_VALUE

if [[ "${MONGO_URI_VALUE}" == *"localhost"* ]] || [[ "${MONGO_URI_VALUE}" == *"127.0.0.1"* ]]; then
  echo "Invalid MONGO_URI for container deployment: localhost/127.0.0.1 cannot be used inside containers"
  exit 1
fi

if [[ "${MONGO_URI_VALUE}" == *"mongo1:"* ]] || [[ "${MONGO_URI_VALUE}" == *"mongo2:"* ]] || [[ "${MONGO_URI_VALUE}" == *"mongo3:"* ]]; then
  echo "MONGO_URI points to a replica-set topology that is no longer used in this repository."
  echo "Use the single-host URI for docker-compose.yml: mongodb://mongo:27017/...&replicaSet=rs0"
  exit 1
fi

if ! [[ "${BE_PORT_VALUE}" =~ ^[0-9]+$ ]]; then
  echo "Invalid BE_PORT: ${BE_PORT_VALUE}. Must be numeric."
  exit 1
fi

if ! [[ "${FE_PORT_VALUE}" =~ ^[0-9]+$ ]]; then
  echo "Invalid FE_PORT: ${FE_PORT_VALUE}. Must be numeric."
  exit 1
fi

COMPOSE_FILE="docker-compose.yml"

CURRENT_BE_IMAGE=$(docker inspect --format='{{.Config.Image}}' acong-be 2>/dev/null || true)
CURRENT_FE_IMAGE=$(docker inspect --format='{{.Config.Image}}' acong-fe 2>/dev/null || true)

echo "Current backend image: ${CURRENT_BE_IMAGE:-none}"
echo "Current frontend image: ${CURRENT_FE_IMAGE:-none}"

cat > .env <<EOF
BE_PORT=${BE_PORT_VALUE}
FE_PORT=${FE_PORT_VALUE}
IS_PROD=true
FE_DOMAIN=${FE_DOMAIN_VALUE}
MONGO_URI=${MONGO_URI_VALUE}
JWT_SECRET=${JWT_SECRET_VALUE}
SMTP_USER=${SMTP_USER_VALUE}
SMTP_PASS=${SMTP_PASS_VALUE}
SMTP_HOST=${SMTP_HOST_VALUE}
SMTP_PORT=${SMTP_PORT_VALUE}
URL_CHANGE_PASSWORD=user-verification
EOF

cat > docker-compose.ci.override.yml <<EOF
services:
  be:
    image: ${REGISTRY_PREFIX}/acong-be:${IMAGE_TAG}
  fe:
    image: ${REGISTRY_PREFIX}/acong-fe:${IMAGE_TAG}
EOF

TARGET_BE_IMAGE="${REGISTRY_PREFIX}/acong-be:${IMAGE_TAG}"
TARGET_FE_IMAGE="${REGISTRY_PREFIX}/acong-fe:${IMAGE_TAG}"

echo "Backend image: ${TARGET_BE_IMAGE}"
echo "Frontend image: ${TARGET_FE_IMAGE}"

docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.override.yml pull be fe
docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.override.yml up -d --remove-orphans
docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.override.yml ps

wait_for_mongo_primary() {
  local ok=0

  for _ in $(seq 1 30); do
    if docker exec acong-mongo mongo --quiet --eval 'db.isMaster().ismaster' 2>/dev/null | tr -d '\r\n' | grep -q '^true$'; then
      ok=1
      break
    fi
    sleep 2
  done

  if [ "$ok" -ne 1 ]; then
    echo "Mongo primary readiness check timed out"
    docker logs --tail=120 acong-mongo || true
    return 1
  fi

  return 0
}

if ! wait_for_mongo_primary; then
  exit 1
fi

check_containers() {
  if [ "$(docker inspect --format='{{.State.Running}}' acong-be 2>/dev/null || echo false)" != "true" ]; then
    echo "Backend container is not running"
    return 1
  fi

  if [ "$(docker inspect --format='{{.State.Running}}' acong-fe 2>/dev/null || echo false)" != "true" ]; then
    echo "Frontend container is not running"
    return 1
  fi

  if ! docker port acong-be 2>/dev/null | grep -q ":${BE_PORT_VALUE}$"; then
    echo "Backend container is not bound to expected host port ${BE_PORT_VALUE}"
    docker port acong-be || true
    return 1
  fi

  return 0
}

check_health() {
  local ok=0

  for _ in $(seq 1 20); do
    if check_containers \
      && (curl -fsS "http://localhost:${BE_PORT_VALUE}/api" >/dev/null || curl -fsS "http://localhost:${BE_PORT_VALUE}/health" >/dev/null || curl -fsS "http://localhost:${BE_PORT_VALUE}/" >/dev/null) \
      && curl -fsS "http://localhost:${FE_PORT_VALUE}/" >/dev/null; then

      if [ -n "${BE_PUBLIC_URL_VALUE:-}" ] && ! curl -fsS "${BE_PUBLIC_URL_VALUE}" >/dev/null; then
        sleep 3
        continue
      fi

      if [ -n "${FE_PUBLIC_URL_VALUE:-}" ] && ! curl -fsS "${FE_PUBLIC_URL_VALUE}" >/dev/null; then
        sleep 3
        continue
      fi

      ok=1
      break
    fi

    sleep 3
  done

  return $((1 - ok))
}

if check_health; then
  echo "Deployment health checks passed"
else
  echo "Deployment health checks failed, starting rollback"
  docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.override.yml logs --tail=200 be || true
  docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.override.yml logs --tail=100 fe || true

  if [ -n "${CURRENT_BE_IMAGE}" ] && [ -n "${CURRENT_FE_IMAGE}" ]; then
    cat > docker-compose.ci.rollback.yml <<EOF
services:
  be:
    image: ${CURRENT_BE_IMAGE}
  fe:
    image: ${CURRENT_FE_IMAGE}
EOF

    docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.rollback.yml up -d --remove-orphans

    if check_health; then
      echo "Rollback successful"
    else
      echo "Rollback failed: services are still unhealthy"
      docker compose -f "${COMPOSE_FILE}" -f docker-compose.ci.rollback.yml logs --tail=200 be || true
      rm -f docker-compose.ci.rollback.yml
      rm -f docker-compose.ci.override.yml
      exit 1
    fi

    rm -f docker-compose.ci.rollback.yml
  else
    echo "Rollback skipped: previous container images not found"
    rm -f docker-compose.ci.override.yml
    exit 1
  fi
fi

rm -f docker-compose.ci.override.yml

cleanup_repo_images() {
  local repository="$1"
  local keep_one="$2"
  local keep_two="$3"

  docker image ls "${repository}" --format '{{.Repository}}:{{.Tag}}' | while read -r img; do
    [ -z "${img}" ] && continue
    [ "${img}" = "${repository}:<none>" ] && continue

    if [ "${img}" = "${keep_one}" ] || [ "${img}" = "${keep_two}" ]; then
      continue
    fi

    docker rmi "${img}" || true
  done
}

cleanup_repo_images "${REGISTRY_PREFIX}/acong-be" "${TARGET_BE_IMAGE}" "${CURRENT_BE_IMAGE}"
cleanup_repo_images "${REGISTRY_PREFIX}/acong-fe" "${TARGET_FE_IMAGE}" "${CURRENT_FE_IMAGE}"

docker image prune -f

echo "=== Running containers ==="
docker ps
echo "=== Images pulled ==="
docker images | grep acong || true

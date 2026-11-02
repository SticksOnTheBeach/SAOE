#!/bin/bash

# 1. Lance Docker Desktop s'il n'est pas démarré, et attend qu'il soit prêt
if ! docker info >/dev/null 2>&1; then
  echo "Démarrage de Docker Desktop..."
  open -a Docker
  until docker info >/dev/null 2>&1; do sleep 2; done
fi

# 2. Démarre la base, ou la crée si elle n'existe pas
if docker ps -a --format '{{.Names}}' | grep -q '^saoe-db$'; then
  docker start saoe-db
else
  docker run --name saoe-db -e POSTGRES_USER=saoe -e POSTGRES_PASSWORD=motdepasse -e POSTGRES_DB=saoe -p 5432:5432 -d postgres:16
fi

# 3. Attend que Postgres accepte les connexions
until docker exec saoe-db pg_isready -U saoe >/dev/null 2>&1; do sleep 1; done
echo "Base prête."

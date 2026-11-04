#!/bin/bash

echo "==================================================================== Lancement de la BDD ===================================================================="
docker start saoe-db 2>/dev/null || docker run --name saoe-db -e POSTGRES_USER=saoe -e POSTGRES_PASSWORD=motdepasse -e POSTGRES_DB=saoe -p 5432:5432 -d postgres:16

echo "==================================================================== Démarrage du frontend... ===================================================================="
cd frontend || exit
npm run dev &

echo "==================================================================== Démarrage du backend... ===================================================================="
cd ../backend || exit
mvn spring-boot:run

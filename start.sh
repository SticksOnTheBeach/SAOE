#!/bin/bash

echo "Démarrage du frontend..."
cd frontend || exit
npm run dev &

echo "Démarrage du backend..."
cd ../backend || exit
mvn spring-boot:run
#!/bin/bash
# Lance tout le projet SAOE sur Mac : base de données, backend et frontend,
# chacun dans sa propre fenêtre Terminal.
# À mettre à la racine du projet, à côté de start-db.sh.

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Ouvre une nouvelle fenêtre Terminal et y exécute la commande donnée
open_terminal() {
  osascript <<APPLESCRIPT
tell application "Terminal"
  activate
  do script "$1"
end tell
APPLESCRIPT
}

# 1. Docker + base de données (fenêtre 1)
open_terminal "cd '$ROOT' && ./start-db.sh"

# 2. Backend (fenêtre 2) : attend que la base soit prête avant de démarrer
open_terminal "cd '$ROOT/backend' && until docker exec saoe-db pg_isready -U saoe >/dev/null 2>&1; do sleep 2; done; mvn spring-boot:run"

# 3. Frontend (fenêtre 3) : installe les dépendances si besoin
open_terminal "cd '$ROOT/frontend' && { [ -d node_modules ] || npm install; } && npm run dev"

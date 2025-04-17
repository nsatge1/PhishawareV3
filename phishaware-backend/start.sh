#!/bin/bash

# Créer un dossier temporaire pour une DB en lecture/écriture
mkdir -p /tmp/db
cp ./phishaware.db /tmp/db/phishaware.db

# Lancer uvicorn avec DATABASE_URL pointant sur le fichier copié
export DATABASE_URL=sqlite:////tmp/db/phishaware.db

cd app/
uvicorn main:app --host 0.0.0.0 --port 10000
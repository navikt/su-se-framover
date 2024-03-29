#!/bin/bash
# Forsøk på å starte su-se-framover i en docker-container, på samme måte som den vil starte i nais. 
# Dette for å kunne verifisere endringer raskere enn å deploye til preprod.

# Be sure to run `docker-compose up -d` first.

# postinstall runs server npm install
npm ci
npm run build
npm --prefix server prune --omit=dev
docker build -t su-se-framover-lokal .

# Need to add .env:
#   NODE_ENV=production
#   AZURE_APP_WELL_KNOWN_URL=http://mock-oauth2-server:4321/default
#   REDIS_HOST=redis
#   HTTP_PROXY=""
#   AZURE_APP_CLIENT_ID=supstonad
# TODO jah: Fix:  ERROR (1): Could not discover issuer: http://mock-oauth2-server:4321/default
docker run --env-file .env -e NODE_ENV=production -p 1234:1234 --network host su-se-framover-lokal

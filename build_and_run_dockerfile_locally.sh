#!/bin/bash
# Be sure to run `docker-compose up -d` first.

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
docker run --env-file .env -p 1234:1234 --network host su-se-framover-lokal

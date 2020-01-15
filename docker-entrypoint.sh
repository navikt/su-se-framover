#!/usr/bin/env sh
set -eu

envsubst '${SU_SE_BAKOVER_URL}' < /app/www/config.template.json > /app/www/config.json

exec "$@"

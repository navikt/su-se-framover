#!/usr/bin/env sh
set -eu

envsubst '${SU_SE_BAKOVER_URL}' < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json

exec "$@"
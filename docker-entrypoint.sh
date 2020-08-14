#!/usr/bin/env sh
set -eu

envsubst '${SU_SE_BAKOVER_URL}' < /app/www/config.template.json > /app/www/config.json

# Vi vil også bytte verdi(er) i `index.html`
# `envsubst` kan ikke operere in-place på en fil,
# så vi lager en midlertidig fil som vi skriver til
# og flytter den så tilbake til index.html
tmpfile=$(mktemp)
dest=/app/www/index.html
cat "$dest" | envsubst '${HODE_URL}' > "$tmpfile" && mv "$tmpfile" "$dest"
chmod 644 "$dest"

exec "$@"

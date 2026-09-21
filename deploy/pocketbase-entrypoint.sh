#!/bin/sh
# Write secrets into pb_data so JS hooks can read them if $os.getenv is empty
# (seen with this PocketBase image's JSVM inside Docker).
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  printf '%s' "$OPENROUTER_API_KEY" > /pb_data/.openrouter_key
fi
if [ -n "${RESEND_API_KEY:-}" ]; then
  printf '%s' "$RESEND_API_KEY" > /pb_data/.resend_key
fi
exec /usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data --publicDir=/pb_public --hooksDir=/pb_hooks

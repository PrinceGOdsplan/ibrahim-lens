#!/bin/sh
# Write the OpenRouter key to pb_data so JS hooks can read it if $os.getenv is empty.
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  printf '%s' "$OPENROUTER_API_KEY" > /pb_data/.openrouter_key
fi
exec /usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data --publicDir=/pb_public --hooksDir=/pb_hooks

#!/bin/bash
# Entry point for all post-write hooks
# Claude Code calls this with JSON on stdin:
# { "tool_name": "Write"|"Edit", "tool_input": { "file_path": "..." } }

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE" ]; then
  exit 0
fi

# Run responsive check
bash "$(dirname "$0")/responsive-check.sh" "$FILE"

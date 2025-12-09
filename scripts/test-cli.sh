#!/usr/bin/env bash
set -e

bun cli env
bun cli login
bun cli ls
# # bun cli connect test
bun cli mcp list-tools test
# bun cli connect test -t cursor
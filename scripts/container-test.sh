#!/usr/bin/env bash
set -e

export GATEWAY_URL=https://app.ex0.co/
bun cli login --email user@director.run --password password
bun cli mcp list-tools test
#!/bin/sh
set -e

npm uninstall -g @director.run/cli
bun run clean
bun run build
cd ./apps/cli
npm link

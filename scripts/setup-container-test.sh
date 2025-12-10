#!/usr/bin/env bash
set -e

cd apps/gateway
NODE_ENV=test bun run db:seed
bun run docker:dev
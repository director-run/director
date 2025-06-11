cli_version=$(node -p "require('./apps/cli/package.json').version")

echo "cli version: ${cli_version}"
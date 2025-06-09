version=$(node -p "require('./apps/cli/package.json').version")

echo "Releasing version ${version}"

git tag -a v${version} -m "Release v${version}"
git push origin "v${version}"
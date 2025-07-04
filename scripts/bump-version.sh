version=$1

if [ -z "$version" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# TODO: make sure on main, everyting is pulled and no changes are pending

git branch v${version}
git checkout v${version}
npm version ${version} --prefix apps/cli
bun run format
git commit -a -m "Release v${version}"
git push -u origin v${version}



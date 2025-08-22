const { getInfo, getInfoFromPullRequest } = require("@changesets/get-github-info");

const getReleaseLine = async (changeset, type, changelogOpts) => {
  if (!changelogOpts?.repo) {
    throw new Error(
      "Please provide a repo to this changelog generator like this:\n" +
      '"changelog": ["./scripts/changelog.js", { "repo": "owner/repo" }]'
    );
  }

  let [firstLine, ...futureLines] = changeset.summary
    .split("\n")
    .map((l) => l.trimRight());

  const links = await getInfo({
    repo: changelogOpts.repo,
    commit: changeset.commit,
  });

  // Format for Mintlify compatibility with proper markdown
  const typeEmoji = {
    major: "🚀",
    minor: "✨", 
    patch: "🐛"
  }[type] || "📝";

  let returnVal = `- ${typeEmoji} **${type.charAt(0).toUpperCase() + type.slice(1)}**: ${firstLine}`;

  if (links.commit) {
    returnVal += ` ([${changeset.commit.slice(0, 7)}](${links.commit}))`;
  }

  if (links.pull) {
    returnVal += ` ${links.pull}`;
  }

  if (links.user) {
    returnVal += ` Thanks ${links.user}!`;
  }

  if (futureLines.length > 0) {
    returnVal += `\n${futureLines.map((l) => `  ${l}`).join("\n")}`;
  }

  return returnVal;
};

const getDependencyReleaseLine = async (changesets, dependenciesUpdated, changelogOpts) => {
  if (dependenciesUpdated.length === 0) return "";

  const changesetLink = `- **Dependencies**: Updated ${dependenciesUpdated.length} dependenc${
    dependenciesUpdated.length === 1 ? "y" : "ies"
  }`;

  return changesetLink;
};

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
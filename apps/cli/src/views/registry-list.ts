import { makeTable } from "@director.run/utilities/cli/index";
import { registryClient } from "../client";

type Entries = Awaited<
  ReturnType<typeof registryClient.entries.getEntries.query>
>["entries"];

export function listEntries(items: Entries) {
  const table = makeTable(["Name", "Homepage", "# Tools"]);
  table.push(
    ...items.map((item) => {
      return [item.name, printUrl(item.homepage), item.tools?.length];
    }),
  );
  console.log(table.toString());
  console.log("");
  console.log(`Total entries: ${items.length}`);
}

function printUrl(url: string) {
  //  don't print any of the get params or the http part
  const urlObj = new URL(url);
  urlObj.search = "";
  urlObj.protocol = "";
  urlObj.host = "";
  return urlObj.toString();
}

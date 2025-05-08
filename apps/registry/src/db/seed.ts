import { fetchAwesomeMCPEntries } from "../importers/awesome-mcp";
import { insertServersIntoDatabase } from "./queries";

export async function seedDatabase() {
  const servers = await fetchAwesomeMCPEntries();
  await insertServersIntoDatabase(servers);
  console.log("Successfully seeded database!");
}

import type { EntryGetParams } from "@director.run/registry/db/schema";

export function printReistryEntry(entry: EntryGetParams) {
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log(`
      Name: ${entry.name}
      Description: ${entry.description}
      
      
      Readme:
      ${entry.readme ? printFirst10Lines(entry.readme) : "No readme"}
    `);
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
  }



  const printFirst10Lines = (text: string) => {
    const lines = text.split("\n");
    return lines.slice(0, 10).join("\n");
  }
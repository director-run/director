import * as config from "../config";

export async function debug() {
  console.log("----------------");
  console.log("__dirname: ", __dirname);
  console.log("__filename: ", __filename);
  console.log(`config:`, config);
  console.log("----------------");
}

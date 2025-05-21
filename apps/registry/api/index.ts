// import express from "express";

import { Registry } from "../src/registry";

// const app = express();

// app.get("/", (req, res) => {
//   res.send("Function: api/index.ts");
// });

// app.listen(3000, () => console.log("Server ready on port 3000."));

// module.exports = app;
const PORT = 3000;
const registry = await Registry.start({ port: PORT });
module.exports = registry.app;

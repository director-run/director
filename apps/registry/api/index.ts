import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Function: api/index.ts");
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;

import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Registry API on Vercel");
});

app.listen(3000, () => console.log("Server ready on port 3000."));

export default app;

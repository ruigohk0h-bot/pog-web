// Netlify Function: /api/trophies
// trophies.json を返す（将来的にDBに差し替え可能）
const path = require("path");
const fs   = require("fs");

exports.handler = async () => {
  const file = path.join(__dirname, "../../public/data/trophies.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data),
  };
};

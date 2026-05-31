// Netlify Function: /api/horses
// horses.json を返す（全馬サマリー）
const path = require("path");
const fs   = require("fs");

exports.handler = async () => {
  const file = path.join(__dirname, "../../public/data/horses.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data),
  };
};

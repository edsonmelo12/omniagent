#!/usr/bin/env node
import https from "node:https";

const WP_URL = "https://amiclube.com.br";
const WP_USER = "edsonrmjunior";
const WP_APP_PASSWORD = "CoBy YZRb OjNf tUV3 I9sw Ma6Q";

const posts = [
  { postId: 13002, title: "AC-30-01", date: "2026-04-30T10:00:00" },
  { postId: 13003, title: "AC-30-01B", date: "2026-05-01T10:00:00" },
];

function updatePost(postId, date) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");
    
    const options = {
      hostname: new URL(WP_URL).hostname,
      path: `/wp-json/wp/v2/posts/${postId}`,
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    };

    const data = JSON.stringify({
      date: date,
      date_gmt: date.replace("-03:00", "+00:00"),
    });

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("📅 Corrigindo datas dos posts...\n");
  for (const item of posts) {
    console.log(`📤 ${item.title}: agendando para ${item.date}...`);
    const result = await updatePost(item.postId, item.date);
    if (result.id) {
      console.log(`  ✅ ${item.date}`);
    } else {
      console.log(`  ❌ ${result.message || result}`);
    }
  }
  console.log("\n✅ Concluído!");
}

run();
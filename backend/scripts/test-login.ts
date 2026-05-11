const API_BASE = "http://localhost:3001";

async function run() {
  console.log("🚀 Testing login for edson@portaldemidias.com...");
  
  const payload = {
    email: "edson@portaldemidias.com",
    password: "admin_portal_2026"
  };

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
    
    if (response.ok) {
      console.log("✅ Login success!");
    } else {
      console.error("❌ Login failed.");
    }
  } catch (error) {
    console.error("❌ Connection failed.", error);
  }
}

run();

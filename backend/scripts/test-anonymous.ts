const API_BASE = "http://localhost:3001";

async function run() {
  console.log("🚀 Testing anonymous login...");
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/anonymous`, {
      method: "POST",
      headers: { "content-type": "application/json" }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Anonymous login success!");
      console.log("User:", result.data.user.email);
    } else {
      console.error("❌ Anonymous login failed:", result.error?.message || response.statusText);
      console.log("Full error:", JSON.stringify(result.error, null, 2));
    }
  } catch (error) {
    console.error("❌ Connection failed.", error);
  }
}

run();

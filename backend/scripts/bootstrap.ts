const API_BASE = "http://localhost:3001";

async function run() {
  console.log("🚀 Bootstrapping platform...");
  
  const payload = {
    agency: { name: "Portal de Mídias", slug: "portal-de-midias" },
    user: { name: "Edson", email: "edson@portaldemidias.com", password: "admin_portal_2026" }
  };

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/bootstrap`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ Platform bootstrapped successfully.");
      console.log("User:", result.data.user.email);
      console.log("Agency:", result.data.agencies[0].name);
    } else {
      console.error("❌ Bootstrap failed:", result.error?.message || response.statusText);
    }
  } catch (error) {
    console.error("❌ Connection failed. Is the backend running on port 3001?", error);
  }
}

run();

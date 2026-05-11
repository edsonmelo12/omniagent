const API_BASE = "http://localhost:3001";

async function run() {
  console.log("🚀 Testing trackProductEvent...");
  
  const payload = {
    eventName: "test-event",
    source: "test-script",
    properties: { foo: "bar" }
  };

  try {
    const response = await fetch(`${API_BASE}/api/v1/events`, {
      method: "POST",
      headers: { 
        "content-type": "application/json",
        "authorization": "Bearer demo:00000000-0000-0000-0000-000000000000" // Dummy token
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("✅ trackProductEvent success!");
      console.log("Result:", JSON.stringify(result.data, null, 2));
    } else {
      console.error("❌ trackProductEvent failed:", result.error?.message || response.statusText);
      console.log("Full error:", JSON.stringify(result.error, null, 2));
    }
  } catch (error) {
    console.error("❌ Connection failed.", error);
  }
}

run();

async function testFinalRegistration() {
    try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "finaltest" + Date.now() + "@example.com",
                password: "SecurePass123",
                name: "Final Test User"
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (response.status === 201) {
            console.log("\n✓ SUCCESS: Registration is working correctly!");
        } else {
            console.log("\n✗ FAILED: Registration still has issues");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testFinalRegistration();

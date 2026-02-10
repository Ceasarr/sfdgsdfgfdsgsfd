async function testDetailedRegister() {
    try {
        const response = await fetch("http://localhost:3000/api/auth/test-register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: "testdetailed" + Date.now() + "@example.com",
                password: "Test123",
                name: "Test User"
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testDetailedRegister();

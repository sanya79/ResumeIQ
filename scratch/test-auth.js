import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

async function testAuth() {
  const email = `test_${Date.now()}@example.com`;
  const password = "Password123!";
  const fullName = "Test User";

  try {
    console.log("1. Registering user...");
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      fullName,
      email,
      password,
      role: "Candidate"
    });

    const user = regRes.data.data.user;
    console.log(`User registered with ID: ${user.id || user._id}`);

    // Since we are running programmatically, let's trigger verification.
    // Wait, the verification token is saved in the database user document.
    // In our backend, verify-email requires the token.
    // Let's get the token by query or we can just try to login first.
    // Let's see if login works even if emailVerified is false.
    console.log("2. Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    console.log("Login successful! Response data user:", loginRes.data.data.user);
    console.log("Access Token:", loginRes.data.data.accessToken);

    console.log("Auth testing done. Verified successfully!");
  } catch (error) {
    console.error("Auth test failed:", error.response ? error.response.data : error.message);
  }
}

testAuth();

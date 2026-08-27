import axios from "axios";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const API_URL = "http://localhost:5000/api/v1";

// Function to generate a simple PDF resume
function createPdfResume(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(24).text("John Doe", { align: "center" });
    doc.fontSize(12).text("john.doe@example.com | (555) 123-4567 | github.com/johndoe", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(16).text("Professional Summary");
    doc.fontSize(10).text("Experienced software developer with strong skills in web development.");
    doc.moveDown(1);

    doc.fontSize(16).text("Experience");
    doc.fontSize(12).text("Senior Software Engineer - TechCorp (2022 - Present)");
    doc.fontSize(10).text("• Developed web applications using React, Node.js, and JavaScript.");
    doc.fontSize(10).text("• Scaled database systems using MongoDB and SQL databases.");
    doc.fontSize(10).text("• Configured Docker containers and worked with GIT version control.");
    doc.moveDown(1);

    doc.fontSize(16).text("Skills");
    doc.fontSize(10).text("React, JavaScript, TypeScript, Node.js, Express, MongoDB, SQL, Docker, Git");
    doc.moveDown(1);

    doc.fontSize(16).text("Education");
    doc.fontSize(12).text("Bachelor of Science in Computer Science - University of Science (2018 - 2021)");

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", (err) => reject(err));
  });
}

async function testPipeline() {
  const resumePath = path.resolve("test_resume.pdf");

  try {
    console.log("1. Generating PDF Resume...");
    await createPdfResume(resumePath);
    console.log("PDF Resume generated at:", resumePath);

    console.log("2. Registering test user...");
    const email = `test_${Date.now()}@example.com`;
    const password = "Password123!";
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      fullName: "Test Candidate",
      email,
      password,
      role: "Candidate"
    });

    const { accessToken } = regRes.data.data;
    console.log("User registered & logged in successfully.");

    console.log("3. Uploading resume...");
    const form = new FormData();
    form.append("resume", fs.createReadStream(resumePath));
    form.append("uploadSource", "Web Dashboard");

    const uploadRes = await axios.post(`${API_URL}/resumes/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log("Upload Response Success!");
    const resume = uploadRes.data.data.resume;
    console.log("Uploaded Resume Details:");
    console.log("- ID:", resume._id);
    console.log("- Original Name:", resume.originalName);
    console.log("- Status:", resume.status);
    console.log("- Version:", resume.version);
    console.log("- ATS Overall Score:", resume.atsScorecard?.overallScore);
    console.log("- Strengths count:", resume.atsScorecard?.strengths?.length);
    console.log("- Weak areas count:", resume.atsScorecard?.weakAreas?.length);
    
    // Cleanup generated PDF
    fs.unlinkSync(resumePath);
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Pipeline test failed:", error.response ? error.response.data : error.message);
    if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
  }
}

testPipeline();

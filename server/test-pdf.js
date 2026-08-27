import axios from "axios";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const API_URL = "http://localhost:5000/api/v1";

function createPdfResume(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(24).text("Jane Doe", { align: "center" });
    doc.fontSize(12).text("jane.doe@example.com | (555) 123-4567 | github.com/janedoe", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(16).text("Experience");
    doc.fontSize(12).text("Software Engineer - TechCorp (2022 - Present)");
    doc.fontSize(10).text("• Developed web applications using React, Node.js, and JavaScript.");
    doc.moveDown(1);

    doc.fontSize(16).text("Skills");
    doc.fontSize(10).text("React, JavaScript, Node.js");
    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", (err) => reject(err));
  });
}

async function testPdfEndpoints() {
  const resumePath = path.resolve("test_resume_pdf.pdf");

  try {
    console.log("1. Generating PDF Resume...");
    await createPdfResume(resumePath);

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

    const resume = uploadRes.data.data.resume;
    const resumeId = resume._id;
    console.log("Uploaded Resume ID:", resumeId);

    console.log("4. Downloading ATS scorecard PDF report...");
    const reportRes = await axios.get(`${API_URL}/resumes/${resumeId}/report-pdf`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "arraybuffer"
    });
    fs.writeFileSync("test_ats_report.pdf", reportRes.data);
    console.log("Saved test_ats_report.pdf - size:", reportRes.data.byteLength);

    console.log("5. Triggering job description match analysis...");
    const jobDescription = `We are looking for a Senior React Developer who has strong experience in React, JavaScript, and TypeScript. Experience with Docker and SQL is a plus. You will work on fullstack web applications and optimize deployment systems.`;
    
    const matchRes = await axios.post(`${API_URL}/matching/analyze`, {
      resumeId,
      jobDescription,
      jobTitle: "Senior React Developer",
      company: "Innovate Inc"
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const match = matchRes.data.data.match;
    const matchId = match._id;
    console.log("Match ID:", matchId);

    console.log("6. Downloading optimized resume PDF...");
    const optRes = await axios.get(`${API_URL}/matching/${matchId}/optimize-pdf`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "arraybuffer"
    });
    fs.writeFileSync("test_optimized_resume.pdf", optRes.data);
    console.log("Saved test_optimized_resume.pdf - size:", optRes.data.byteLength);

    console.log("7. Downloading tailored resume PDF...");
    const tailRes = await axios.get(`${API_URL}/matching/${matchId}/generate-pdf`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "arraybuffer"
    });
    fs.writeFileSync("test_tailored_resume.pdf", tailRes.data);
    console.log("Saved test_tailored_resume.pdf - size:", tailRes.data.byteLength);

    fs.unlinkSync(resumePath);
    fs.unlinkSync("test_ats_report.pdf");
    fs.unlinkSync("test_optimized_resume.pdf");
    fs.unlinkSync("test_tailored_resume.pdf");
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("PDF test failed:", error);
    if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
  }
}

testPdfEndpoints();

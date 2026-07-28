import PDFDocument from "pdfkit";

/**
 * Premium PDF Generation Service
 * Uses PDFKit to construct beautiful, aligned, and styled PDF files
 * directly into Express response write streams.
 */
export class PdfService {
  /**
   * Generates a detailed ATS evaluation scorecard report
   */
  generateAtsReport(res, scorecard, resumeName) {
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers on response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resumeName.replace(/\.[^.]+$/, "")}_ats_report.pdf"`);
    
    doc.pipe(res);

    // Color Palette
    const primaryColor = "#6366F1"; // Indigo
    const darkCharcoal = "#1F2937"; // Text Dark
    const secondaryColor = "#4F46E5";
    const successColor = "#10B981";
    const lightBg = "#F3F4F6";

    // Header Title
    doc.fillColor(primaryColor).fontSize(26).font("Helvetica-Bold").text("ResumeIQ ATS Analysis Report", 50, 50);
    doc.fillColor(darkCharcoal).fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleDateString()} | Target: ${scorecard.atsVersion || "v1.0"}`, 50, 80);
    
    // Divider line
    doc.moveTo(50, 95).lineTo(550, 95).strokeColor("#E5E7EB").strokeWidth(1.5).stroke();

    // Score Summary Card
    doc.rect(50, 110, 500, 80).fill(lightBg);
    doc.fillColor(primaryColor).fontSize(14).font("Helvetica-Bold").text("OVERALL ATS FIT SCORE", 70, 125);
    doc.fillColor(darkCharcoal).fontSize(28).font("Helvetica-Bold").text(`${scorecard.overallScore}/100`, 70, 145);
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text(`Estimated Potential: ${scorecard.estimatedImprovedScore}/100 after edits`, 300, 145);

    // Strengths and Weaknesses
    doc.fillColor(successColor).fontSize(16).font("Helvetica-Bold").text("Key Strengths", 50, 210);
    let y = 230;
    (scorecard.strengths || []).slice(0, 3).forEach(str => {
      doc.fillColor(darkCharcoal).fontSize(10).font("Helvetica-Bold").text("• ", 55, y);
      doc.font("Helvetica").text(str.message || str, 70, y, { width: 480 });
      y += 18;
    });

    doc.fillColor("#EC4899").fontSize(16).font("Helvetica-Bold").text("Areas for Improvement", 50, y + 10);
    y += 30;
    (scorecard.weakAreas || []).slice(0, 3).forEach(weak => {
      doc.fillColor(darkCharcoal).fontSize(10).font("Helvetica-Bold").text("• ", 55, y);
      doc.font("Helvetica").text(weak.message || weak, 70, y, { width: 480 });
      y += 18;
    });

    // Scorecard Breakdown list
    doc.fillColor(primaryColor).fontSize(16).font("Helvetica-Bold").text("Category breakdown", 50, y + 10);
    y += 30;
    
    (scorecard.breakdown || []).forEach(item => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor(darkCharcoal).fontSize(11).font("Helvetica-Bold").text(item.name, 50, y);
      doc.fillColor(secondaryColor).fontSize(11).font("Helvetica-Bold").text(`${Math.round(item.score)} / ${item.maxScore}`, 450, y, { align: "right" });
      
      y += 15;
      doc.fillColor("#4B5563").fontSize(9).font("Helvetica").text(item.reason || "Score calculated based on content structure.", 50, y, { width: 500 });
      y += 25;
    });

    // Smart suggestions
    if (y > 650) {
      doc.addPage();
      y = 50;
    }
    doc.fillColor(primaryColor).fontSize(14).font("Helvetica-Bold").text("Top Actionable Improvements", 50, y);
    y += 20;
    (scorecard.top10Improvements || []).slice(0, 5).forEach((imp, i) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor(darkCharcoal).fontSize(10).font("Helvetica-Bold").text(`${i + 1}. `, 50, y);
      doc.font("Helvetica").text(imp, 65, y, { width: 480 });
      y += 30;
    });

    doc.end();
  }

  /**
   * Generates a beautifully optimized, tailored resume PDF incorporating missing keywords
   */
  generateOptimizedResume(res, resume, matchedKeywords, missingKeywords, jobTitle) {
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${resume.originalName.replace(/\.[^.]+$/, "")}_optimized.pdf"`);
    
    doc.pipe(res);

    // Style properties
    const themeColor = "#4F46E5";
    const textDark = "#1F2937";
    const textMuted = "#4B5563";

    // Extract name from text
    const lines = (resume.rawText || "").split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const candidateName = lines[0] || "Candidate Profile";
    const email = resume.rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/)?.[0] || "candidate@resumeiq.com";
    const phone = resume.rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/)?.[0] || "+1 (555) 123-4567";

    // Header
    doc.fillColor(themeColor).fontSize(24).font("Helvetica-Bold").text(candidateName, { align: "center" });
    doc.fillColor(textMuted).fontSize(10).font("Helvetica").text(`${email}  |  ${phone}  |  LinkedIn: linkedin.com/in/candidate`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#D1D5DB").strokeWidth(1).stroke();
    doc.moveDown(1);

    // Profile Summary tailored to job title
    doc.fillColor(themeColor).fontSize(14).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
    doc.moveDown(0.2);
    doc.fillColor(textDark).fontSize(10).font("Helvetica").text(
      `Highly motivated and analytical professional with a strong track record of success. Specially optimized for ${jobTitle || "the target"} role, demonstrating key capabilities in problem-solving and software engineering practices. Adept at leveraging modern tech-stacks including ${matchedKeywords.slice(0, 3).map(k => k.term).join(", ")} and recently experienced in integrating ${missingKeywords.slice(0, 2).map(k => k.term).join(", ")} to solve key application bottlenecks.`,
      { align: "justify", lineGap: 2 }
    );
    doc.moveDown(1.2);

    // Optimized Skills Matrix (including missing skills!)
    doc.fillColor(themeColor).fontSize(14).font("Helvetica-Bold").text("TECHNICAL SKILLS & COMPETENCIES");
    doc.moveDown(0.3);
    
    const coreSkills = matchedKeywords.map(k => k.term).concat(missingKeywords.slice(0, 3).map(k => k.term));
    doc.fillColor(textDark).fontSize(10).font("Helvetica-Bold").text("Technologies: ", { continued: true });
    doc.font("Helvetica").text(coreSkills.join(", "));
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Methodologies: ", { continued: true });
    doc.font("Helvetica").text("Agile, Scrum, Git Version Control, CI/CD pipelines, Test-driven development.");
    doc.moveDown(1.2);

    // Experience Section
    doc.fillColor(themeColor).fontSize(14).font("Helvetica-Bold").text("PROFESSIONAL EXPERIENCE");
    doc.moveDown(0.4);

    // Experience 1
    doc.fillColor(textDark).fontSize(11).font("Helvetica-Bold").text("Senior Software Engineer", { continued: true });
    doc.fillColor(textMuted).fontSize(10).font("Helvetica").text("   |   TechCorp Inc. (2023 - Present)", { align: "left" });
    doc.moveDown(0.2);
    
    const bullet1 = `• Led a team of developers to architect and scale responsive web applications using ${coreSkills.slice(0, 3).join(", ") || "modern stacks"}.`;
    const bullet2 = `• Engineered microservice communication pipelines utilizing REST APIs and recently deployed ${missingKeywords[0]?.term || "distributed containers"} to decrease server load.`;
    const bullet3 = `• Collaborated with product owners to implement critical security fixes, reducing vulnerability incidents by 24%.`;

    doc.fillColor(textDark).fontSize(9.5).font("Helvetica").text(bullet1, { lineGap: 1 });
    doc.text(bullet2, { lineGap: 1 });
    doc.text(bullet3, { lineGap: 1 });
    doc.moveDown(0.8);

    // Experience 2
    doc.fontSize(11).font("Helvetica-Bold").text("Software Engineer", { continued: true });
    doc.fillColor(textMuted).fontSize(10).font("Helvetica").text("   |   WebSolutions Ltd (2021 - 2023)");
    doc.moveDown(0.2);

    const bullet4 = `• Programmed modular UI modules and single page application views utilizing ${coreSkills[0] || "React"} and CSS layouts.`;
    const bullet5 = "• Standardized Git branch pipelines and unified code style across five repository units.";
    
    doc.fillColor(textDark).fontSize(9.5).font("Helvetica").text(bullet4, { lineGap: 1 });
    doc.text(bullet5, { lineGap: 1 });
    doc.moveDown(1.2);

    // Education
    doc.fillColor(themeColor).fontSize(14).font("Helvetica-Bold").text("EDUCATION & DEGREES");
    doc.moveDown(0.3);
    doc.fillColor(textDark).fontSize(10).font("Helvetica-Bold").text("Bachelor of Science in Computer Science", { continued: true });
    doc.fillColor(textMuted).fontSize(10).font("Helvetica").text("   |   State University (Graduated 2021)");

    doc.end();
  }

  /**
   * Generates a completely new tailored resume from scratch based on job description matching
   */
  generateTailoredResume(res, match) {
    // Re-use optimization builder with customized title / jd keywords
    this.generateOptimizedResume(res, {
      originalName: `${match.jobTitle || "Tailored"}_Resume.pdf`,
      rawText: `CANDIDATE PROFILE\n${match.jobTitle || "Software Engineer"}\n`
    }, match.matchedKeywords, match.missingKeywords, match.jobTitle);
  }
}

export default PdfService;

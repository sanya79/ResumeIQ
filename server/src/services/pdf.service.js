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
  generateAtsReport(res, scorecard = {}, resumeName = "resume") {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    const sanitizedFileName = (resumeName || "resume")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "_");

    if (res && typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedFileName}_ATS_Report.pdf"`
      );
    }

    doc.pipe(res);

    // Color Palette
    const primaryDark = "#1E1B4B";
    const primaryIndigo = "#4F46E5";
    const successGreen = "#059669";
    const warningRose = "#E11D48";
    const textDark = "#0F172A";
    const textMuted = "#475569";
    const bgLight = "#F8FAFC";
    const borderLight = "#E2E8F0";

    const pageHeight = 841.89; // A4 height in pt
    const marginBottom = 45;

    const renderHeaderBanner = () => {
      doc.rect(0, 0, 595.28, 6).fill(primaryIndigo);

      doc.fillColor(primaryDark).fontSize(18).font("Helvetica-Bold").text("ResumeIQ", 40, 22, { continued: true });
      doc.fillColor(primaryIndigo).fontSize(18).font("Helvetica-Bold").text("  |  ATS Evaluation Report");

      doc.fillColor(textMuted).fontSize(8.5).font("Helvetica")
        .text(`Candidate File: ${resumeName || "Resume.pdf"}   •   Generated: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, 40, 44);

      doc.moveTo(40, 58).lineTo(555, 58).lineWidth(1).strokeColor(borderLight).stroke();
      doc.y = 68;
    };

    const ensureSpace = (neededHeight) => {
      if (doc.y + neededHeight > pageHeight - marginBottom) {
        doc.addPage();
        renderHeaderBanner();
      }
    };

    renderHeaderBanner();

    // -------------------------------------------------------------
    // SECTION 1: OVERALL ATS SCORE CARD
    // -------------------------------------------------------------
    const overallScore = Math.round(scorecard.overallScore || 0);
    const estimatedImprovedScore = Math.round(scorecard.estimatedImprovedScore || overallScore);
    const scoreColor = overallScore >= 80 ? successGreen : overallScore >= 60 ? "#D97706" : warningRose;

    doc.roundedRect(40, doc.y, 515, 92, 6).fillAndStroke(bgLight, borderLight);

    const cardTop = doc.y + 12;
    doc.fillColor(textMuted).fontSize(9.5).font("Helvetica-Bold").text("OVERALL ATS FIT SCORE", 58, cardTop);

    doc.fillColor(scoreColor).fontSize(32).font("Helvetica-Bold").text(`${overallScore}`, 58, cardTop + 16, { continued: true });
    doc.fillColor(textMuted).fontSize(15).font("Helvetica").text(" / 100", { continued: false });

    const statusText = overallScore >= 80 ? "EXCELLENT ATS FIT" : overallScore >= 60 ? "MODERATE FIT — EDITS RECOMMENDED" : "NEEDS SIGNIFICANT OPTIMIZATION";
    doc.fillColor(scoreColor).fontSize(9.5).font("Helvetica-Bold").text(statusText, 58, cardTop + 54);

    doc.fillColor(primaryDark).fontSize(10.5).font("Helvetica-Bold").text("Score Potential:", 320, cardTop + 14);
    doc.fillColor(successGreen).fontSize(18).font("Helvetica-Bold").text(`${estimatedImprovedScore} / 100`, 320, cardTop + 28);
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text(`+${Math.max(0, estimatedImprovedScore - overallScore)} pts boost with suggested edits`, 320, cardTop + 52);

    const barY = cardTop + 70;
    doc.rect(58, barY, 478, 7).fill("#E2E8F0");
    doc.rect(58, barY, Math.min(478, (overallScore / 100) * 478), 7).fill(scoreColor);

    doc.y = cardTop + 90;

    // -------------------------------------------------------------
    // SECTION 2: KEY STRENGTHS & IMPROVEMENT AREAS
    // -------------------------------------------------------------
    const strengths = scorecard.strengths || [];
    const weakAreas = scorecard.weakAreas || [];

    if (strengths.length > 0) {
      doc.moveDown(0.8);
      ensureSpace(40);
      doc.fillColor(successGreen).fontSize(12).font("Helvetica-Bold").text("KEY STRENGTHS IDENTIFIED");
      doc.moveDown(0.3);

      strengths.slice(0, 4).forEach((str) => {
        const textStr = typeof str === "string" ? str : str.message || str.name || "";
        if (!textStr) return;
        const h = doc.heightOfString(textStr, { width: 490, fontSize: 9 });
        ensureSpace(h + 6);
        const bulletY = doc.y;
        doc.fillColor(successGreen).fontSize(10).font("Helvetica-Bold").text("✓", 42, bulletY);
        doc.fillColor(textDark).fontSize(9).font("Helvetica").text(textStr, 56, bulletY, { width: 495, lineGap: 2 });
        doc.y = bulletY + h + 5;
      });
    }

    if (weakAreas.length > 0) {
      doc.moveDown(0.6);
      ensureSpace(40);
      doc.fillColor(warningRose).fontSize(12).font("Helvetica-Bold").text("CRITICAL AREAS FOR IMPROVEMENT");
      doc.moveDown(0.3);

      weakAreas.slice(0, 4).forEach((weak) => {
        const textWeak = typeof weak === "string" ? weak : weak.message || weak.name || "";
        if (!textWeak) return;
        const h = doc.heightOfString(textWeak, { width: 490, fontSize: 9 });
        ensureSpace(h + 6);
        const bulletY = doc.y;
        doc.fillColor(warningRose).fontSize(10).font("Helvetica-Bold").text("!", 43, bulletY);
        doc.fillColor(textDark).fontSize(9).font("Helvetica").text(textWeak, 56, bulletY, { width: 495, lineGap: 2 });
        doc.y = bulletY + h + 5;
      });
    }

    // -------------------------------------------------------------
    // SECTION 3: CATEGORY BREAKDOWN
    // -------------------------------------------------------------
    const breakdown = scorecard.breakdown || [];
    if (breakdown.length > 0) {
      doc.moveDown(0.8);
      ensureSpace(40);
      doc.fillColor(primaryDark).fontSize(12).font("Helvetica-Bold").text("DETAILED CATEGORY BREAKDOWN");
      doc.moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).lineWidth(1.5).strokeColor(primaryIndigo).stroke();
      doc.moveDown(0.6);

      breakdown.forEach((item) => {
        const itemScore = Math.round(item.score || 0);
        const maxScore = item.maxScore || 100;
        const percent = Math.min(100, Math.max(0, Math.round((itemScore / maxScore) * 100)));
        const barColor = percent >= 80 ? successGreen : percent >= 60 ? "#D97706" : warningRose;

        const reasonText = item.reason || "Calculated based on target ATS rules.";
        const reasonHeight = doc.heightOfString(reasonText, { width: 515, fontSize: 8.5 });
        const blockNeeded = 36 + reasonHeight;

        ensureSpace(blockNeeded);

        const startY = doc.y;

        doc.fillColor(textDark).fontSize(10).font("Helvetica-Bold").text(item.name || "Category", 40, startY);
        doc.fillColor(barColor).fontSize(10).font("Helvetica-Bold").text(`${itemScore} / ${maxScore}`, 400, startY, { align: "right", width: 155 });

        const progressY = startY + 14;
        doc.rect(40, progressY, 515, 4).fill("#E2E8F0");
        doc.rect(40, progressY, (percent / 100) * 515, 4).fill(barColor);

        doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text(reasonText, 40, progressY + 8, { width: 515, lineGap: 1.5 });
        doc.y = progressY + 8 + reasonHeight + 10;
      });
    }

    // -------------------------------------------------------------
    // SECTION 4: TOP ACTIONABLE RECOMMENDATIONS
    // -------------------------------------------------------------
    const topImprovements = scorecard.top10Improvements || [];
    if (topImprovements.length > 0) {
      doc.moveDown(0.8);
      ensureSpace(40);
      doc.fillColor(primaryDark).fontSize(12).font("Helvetica-Bold").text("TOP ACTIONABLE RECOMMENDATIONS");
      doc.moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).lineWidth(1.5).strokeColor(primaryIndigo).stroke();
      doc.moveDown(0.6);

      topImprovements.slice(0, 8).forEach((imp, i) => {
        const textImp = typeof imp === "string" ? imp : imp.suggestion || imp.message || "";
        if (!textImp) return;

        const textHeight = doc.heightOfString(textImp, { width: 490, fontSize: 9 });
        ensureSpace(textHeight + 8);

        const itemY = doc.y;
        doc.fillColor(primaryIndigo).fontSize(9.5).font("Helvetica-Bold").text(`${i + 1}.`, 40, itemY);
        doc.fillColor(textDark).fontSize(9).font("Helvetica").text(textImp, 56, itemY, { width: 495, lineGap: 2 });
        doc.y = itemY + textHeight + 6;
      });
    }

    // -------------------------------------------------------------
    // FOOTER (ALL PAGES)
    // -------------------------------------------------------------
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      doc.moveTo(40, 805).lineTo(555, 805).lineWidth(0.5).strokeColor(borderLight).stroke();
      doc.fillColor(textMuted).fontSize(8).font("Helvetica").text("ResumeIQ ATS Intelligence Engine  •  Confidential Scorecard Report", 40, 812);
      doc.fillColor(textMuted).fontSize(8).font("Helvetica").text(`Page ${i + 1} of ${pages.count}`, 40, 812, { align: "right", width: 515 });
    }

    doc.end();
  }

  /**
   * Generates a beautifully optimized, tailored resume PDF incorporating missing keywords
   */
  generateOptimizedResume(res, resume = {}, matchedKeywords = [], missingKeywords = [], jobTitle = "Software Engineer") {
    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      bufferPages: true,
    });

    const candidateName = (
      resume.parsedProfile?.candidateProfile?.fullName ||
      (resume.rawText || "").split("\n").map(l => l.trim()).filter(l => l.length > 0)[0] ||
      (resume.originalName || "Candidate").replace(/\.[^.]+$/, "").replace(/[_-]/g, " ")
    );

    const sanitizedFileName = candidateName.replace(/[^a-z0-9_-]+/gi, "_");

    if (res && typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedFileName}_Overleaf_Improved_Resume.pdf"`
      );
    }

    doc.pipe(res);

    // Overleaf / LaTeX Deedy Styling Palette
    const primaryDark = "#0F172A"; // Slate 900
    const accentIndigo = "#312E81"; // Deep Indigo Accent
    const textDark = "#1E293B";    // Slate 800 for body
    const textMuted = "#475569";   // Slate 600 for subtitles
    const dividerColor = "#94A3B8"; // Slate 400 for LaTeX horizontal rules

    const pageHeight = 841.89;
    const marginBottom = 36;

    const ensureSpace = (neededHeight) => {
      if (doc.y + neededHeight > pageHeight - marginBottom) {
        doc.addPage();
        doc.y = 36;
      }
    };

    // -------------------------------------------------------------
    // OVERLEAF LATEX HEADER
    // -------------------------------------------------------------
    doc.fillColor(primaryDark).fontSize(20).font("Helvetica-Bold").text(candidateName.toUpperCase(), { align: "center" });
    doc.moveDown(0.2);

    const rawText = resume.rawText || "";
    const email = resume.parsedProfile?.candidateProfile?.email || rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/)?.[0] || "email@example.com";
    const phone = resume.parsedProfile?.candidateProfile?.phoneNumber || rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/)?.[0] || "+1 (555) 019-2834";
    const linkedin = resume.parsedProfile?.candidateProfile?.linkedin || rawText.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i)?.[0] || "linkedin.com/in/candidate";
    const github = resume.parsedProfile?.candidateProfile?.github || rawText.match(/github\.com\/([A-Za-z0-9_-]+)/i)?.[0] || "github.com/candidate";

    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica")
       .text(`${email}   |   ${phone}   |   ${linkedin}   |   ${github}`, { align: "center" });

    doc.moveDown(0.5);
    doc.moveTo(36, doc.y).lineTo(559, doc.y).lineWidth(1.2).strokeColor(primaryDark).stroke();
    doc.moveDown(0.6);

    const renderSectionHeader = (title) => {
      ensureSpace(35);
      doc.moveDown(0.3);
      doc.fillColor(accentIndigo).fontSize(10.5).font("Helvetica-Bold").text(title.toUpperCase(), 36);
      doc.moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).lineWidth(0.75).strokeColor(dividerColor).stroke();
      doc.moveDown(0.4);
    };

    // -------------------------------------------------------------
    // SECTION 1: PROFESSIONAL SUMMARY (FIXED & IMPROVED)
    // -------------------------------------------------------------
    renderSectionHeader("Professional Summary");

    const matchedTerms = (matchedKeywords || []).map(k => typeof k === "string" ? k : k.term);
    const missingTerms = (missingKeywords || []).map(k => typeof k === "string" ? k : k.term);
    const topKeywords = Array.from(new Set([...matchedTerms, ...missingTerms])).filter(Boolean);

    const skillsOverview = topKeywords.slice(0, 6).join(", ") || "full-stack development, software architecture, and cloud deployment";
    const summaryText = `High-performing ${jobTitle || "Software Professional"} with a strong background in software engineering, system optimization, and technical problem-solving. Proficient in ${skillsOverview}. Demonstrated track record of delivering clean, scalable code and collaborating effectively in fast-paced development environments. Focused on engineering high-availability solutions and continuous technical improvement.`;

    const summaryHeight = doc.heightOfString(summaryText, { width: 523, fontSize: 9 });
    ensureSpace(summaryHeight + 6);
    doc.fillColor(textDark).fontSize(9).font("Helvetica").text(summaryText, 36, doc.y, { width: 523, lineGap: 2, align: "justify" });
    doc.moveDown(0.6);

    // -------------------------------------------------------------
    // SECTION 2: TECHNICAL SKILLS MATRIX
    // -------------------------------------------------------------
    renderSectionHeader("Technical Skills");

    const skillList = topKeywords.length > 0 ? topKeywords : ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Python", "Docker", "Git", "REST APIs"];

    ensureSpace(35);
    doc.fillColor(textDark).fontSize(9).font("Helvetica-Bold").text("Languages & Core Tech: ", 36, doc.y, { continued: true });
    doc.font("Helvetica").text(skillList.slice(0, 7).join(", "));
    doc.moveDown(0.3);

    doc.font("Helvetica-Bold").text("Frameworks & Developer Tools: ", 36, doc.y, { continued: true });
    doc.font("Helvetica").text(skillList.slice(7).concat(["Git", "REST APIs", "CI/CD", "Docker", "Agile/Scrum"]).slice(0, 8).join(", "));
    doc.moveDown(0.6);

    // -------------------------------------------------------------
    // SECTION 3: PROFESSIONAL EXPERIENCE (FIXED WITH METRICS & BULLETS)
    // -------------------------------------------------------------
    renderSectionHeader("Professional Experience");

    const rawLines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const bulletCandidates = rawLines.filter(l => l.startsWith("-") || l.startsWith("•") || l.startsWith("*") || l.match(/^[0-9]+\./))
      .map(l => l.replace(/^[-•*0-9.]+\s*/, ""));

    // Experience Item 1
    ensureSpace(60);
    doc.fillColor(primaryDark).fontSize(10).font("Helvetica-Bold").text(jobTitle || "Senior Software Engineer", 36, doc.y, { continued: true });
    doc.fillColor(textMuted).fontSize(9).font("Helvetica-Oblique").text("  |  Tech Solutions & Software Inc.", { continued: false });
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text("Jan 2023 – Present", 400, doc.y - 11, { align: "right", width: 159 });
    doc.moveDown(0.25);

    const b1 = bulletCandidates[0] || `Architected and scaled responsive client-side applications using ${skillList[0] || "React"} and modern state management, increasing user engagement by 28%.`;
    const b2 = bulletCandidates[1] || `Engineered high-throughput backend RESTful APIs using ${skillList[1] || "Node.js"}, optimizing database query indexing and reducing response latency by 35%.`;
    const b3 = bulletCandidates[2] || `Implemented automated CI/CD deployment pipelines and comprehensive unit testing suites, achieving 92% code coverage.`;

    [b1, b2, b3].forEach(bullet => {
      const bh = doc.heightOfString(bullet, { width: 508, fontSize: 8.5 });
      ensureSpace(bh + 3);
      const by = doc.y;
      doc.fillColor(accentIndigo).fontSize(8.5).font("Helvetica-Bold").text("•", 42, by);
      doc.fillColor(textDark).fontSize(8.5).font("Helvetica").text(bullet, 52, by, { width: 507, lineGap: 1.5 });
      doc.y = by + bh + 3;
    });

    // Experience Item 2
    doc.moveDown(0.4);
    ensureSpace(50);
    doc.fillColor(primaryDark).fontSize(10).font("Helvetica-Bold").text("Software Development Engineer", 36, doc.y, { continued: true });
    doc.fillColor(textMuted).fontSize(9).font("Helvetica-Oblique").text("  |  Innovate Tech Labs", { continued: false });
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text("Jun 2021 – Dec 2022", 400, doc.y - 11, { align: "right", width: 159 });
    doc.moveDown(0.25);

    const b4 = bulletCandidates[3] || "Developed modular UI components and maintained standardized code repositories across cross-functional product squads.";
    const b5 = bulletCandidates[4] || "Refactored legacy codebases to adopt modern asynchronous paradigms, resolving critical security vulnerabilities and memory leaks.";

    [b4, b5].forEach(bullet => {
      const bh = doc.heightOfString(bullet, { width: 508, fontSize: 8.5 });
      ensureSpace(bh + 3);
      const by = doc.y;
      doc.fillColor(accentIndigo).fontSize(8.5).font("Helvetica-Bold").text("•", 42, by);
      doc.fillColor(textDark).fontSize(8.5).font("Helvetica").text(bullet, 52, by, { width: 507, lineGap: 1.5 });
      doc.y = by + bh + 3;
    });

    // -------------------------------------------------------------
    // SECTION 4: PROJECTS
    // -------------------------------------------------------------
    renderSectionHeader("Projects");

    ensureSpace(45);
    doc.fillColor(primaryDark).fontSize(9.5).font("Helvetica-Bold").text("Full-Stack Enterprise Analytics Platform", 36, doc.y);
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica-Oblique").text(`Tech Stack: ${skillList.slice(0, 4).join(", ")}`, 36, doc.y + 2);
    doc.moveDown(0.25);

    const pb1 = bulletCandidates[5] || "Created a web-based data visualization platform capable of processing complex datasets into real-time interactive charts.";
    const pbh = doc.heightOfString(pb1, { width: 508, fontSize: 8.5 });
    ensureSpace(pbh + 3);
    const pby = doc.y;
    doc.fillColor(accentIndigo).fontSize(8.5).font("Helvetica-Bold").text("•", 42, pby);
    doc.fillColor(textDark).fontSize(8.5).font("Helvetica").text(pb1, 52, pby, { width: 507, lineGap: 1.5 });
    doc.y = pby + pbh + 4;

    // -------------------------------------------------------------
    // SECTION 5: EDUCATION
    // -------------------------------------------------------------
    renderSectionHeader("Education");

    ensureSpace(28);
    doc.fillColor(primaryDark).fontSize(9.5).font("Helvetica-Bold").text("Bachelor of Technology / Science in Computer Science & Engineering", 36, doc.y);
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text("State University   •   First Class Honors", 36, doc.y + 2);
    doc.fillColor(textMuted).fontSize(8.5).font("Helvetica").text("Graduated 2021", 400, doc.y - 9, { align: "right", width: 159 });

    // Page Numbering Footer
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor(textMuted).fontSize(8).font("Helvetica").text(`Page ${i + 1} of ${pages.count}`, 36, 812, { align: "center", width: 523 });
    }

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

export function buildResumeKnowledgeGraph(parsedProfile = {}) {
  const nodes = [];
  const edges = [];
  const seenNodes = new Set();

  function addNode(id, label, type, meta = {}) {
    if (seenNodes.has(id)) return;
    seenNodes.add(id);
    nodes.push({ id, label, type, ...meta });
  }

  function addSkillEdge(source, skillLabel) {
    const normalizedSkill = String(skillLabel || "").trim();
    if (!normalizedSkill) return;

    const skillId = `skill:${normalizedSkill}`;
    addNode(skillId, normalizedSkill, "skill", { size: 16 });
    const edgeKey = `${source}->${skillId}`;
    if (!edges.some((edge) => `${edge.source}->${edge.target}` === edgeKey)) {
      edges.push({ source, target: skillId, type: "uses" });
    }
  }

  const skills = [
    ...(Array.isArray(parsedProfile.skills?.technical) ? parsedProfile.skills.technical : []),
    ...(Array.isArray(parsedProfile.skills?.soft) ? parsedProfile.skills.soft : []),
  ];

  const uniqueSkills = [...new Set(skills.map((skill) => String(skill).trim()).filter(Boolean))];
  uniqueSkills.forEach((skill) => addNode(`skill:${skill}`, skill, "skill", { size: 16 }));

  (parsedProfile.projects || []).forEach((project, index) => {
    const projectId = `project:${index + 1}`;
    addNode(projectId, project.name || `Project ${index + 1}`, "project", { size: 18 });
    const technologies = Array.isArray(project.technologies) ? project.technologies : [];
    technologies.forEach((tech) => addSkillEdge(projectId, tech));
  });

  (parsedProfile.experience || []).forEach((item, index) => {
    const experienceId = `experience:${index + 1}`;
    addNode(experienceId, item.position || item.company || `Experience ${index + 1}`, "experience", { size: 20 });
    const highlights = Array.isArray(item.highlights) ? item.highlights : [];
    const experienceSkills = uniqueSkills.filter((skill) =>
      highlights.some((highlight) => String(highlight).toLowerCase().includes(skill.toLowerCase()))
    );
    experienceSkills.forEach((skill) => addSkillEdge(experienceId, skill));
  });

  (parsedProfile.certifications || []).forEach((certification, index) => {
    const certificationId = `certification:${index + 1}`;
    addNode(certificationId, certification.name || `Certification ${index + 1}`, "certification", { size: 18 });

    const certTerms = [
      certification.name,
      certification.provider,
      ...(Array.isArray(certification.skills) ? certification.skills : []),
    ].filter(Boolean).map((value) => String(value));

    certTerms.forEach((term) => {
      const normalizedTerm = term.toLowerCase();
      const match = uniqueSkills.find((skill) => {
        const skillLower = skill.toLowerCase();
        return skillLower === normalizedTerm || normalizedTerm.includes(skillLower) || skillLower.includes(normalizedTerm);
      });
      if (match) addSkillEdge(certificationId, match);
    });
  });

  return { nodes, edges };
}

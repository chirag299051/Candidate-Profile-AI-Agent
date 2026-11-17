import candidateProfile from "../data/candidateProfile.js";
export function createProfileDocuments() {
  const documents = [];
  const personal = candidateProfile.personalDetails;
  const personalContent = [
    personal.name && `Candidate Name: ${personal.name}`,
    personal.location && `Location: ${personal.location}`,
    personal.professionalSummary &&
      `Professional Summary: ${personal.professionalSummary}`,
  ]
    .filter(Boolean)
    .join("\n");
  if (personalContent) {
    documents.push({
      section: "personal",
      content: personalContent,
    });
  }
  candidateProfile.certifications.forEach((certification) => {
    documents.push({
      section: "certification",
      content: `Certification: ${certification.name}
Issuer: ${certification.issuer}`,
    });
  });
  Object.entries(candidateProfile.skills).forEach(([category, skills]) => {
    if (skills.length > 0) {
      documents.push({
        section: "skills",
        content: `${category} skills: ${skills.join(", ")}`,
      });
    }
  });
  candidateProfile.projects.forEach((project) => {
    documents.push({
      section: "project",
      content: `Project: ${project.name}
Description: ${project.description}
Technologies: ${project.technologies.join(", ")}
Features: ${project.features.join(", ")}
Outcome: ${project.outcome}`,
    });
  });
  candidateProfile.education.forEach((education) => {
    documents.push({
      section: "education",
      content: JSON.stringify(education),
    });
  });
  candidateProfile.experience.forEach((experience) => {
    documents.push({
      section: "experience",
      content: JSON.stringify(experience),
    });
  });
  candidateProfile.hobbies.forEach((hobby) => {
    documents.push({
      section: "hobbies",
      content: `Hobby: ${hobby}`,
    });
  });
  candidateProfile.interests.forEach((interest) => {
    documents.push({
      section: "interests",
      content: `Interest: ${interest}`,
    });
  });
  return documents;
}

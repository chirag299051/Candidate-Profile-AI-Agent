const candidateProfile = {
  personalDetails: {
    name: "Chirag Singh",
    location: "Noida",
    professionalSummary: "Software Engineer with 3 years of experience.",
  },
  education: [
    "B.Tech in IT from VIT University",
    "MS in Software Development from Pace University New York.",
  ],
  certifications: [
    {
      name: "Salesforce Certified Administrator",
      issuer: "Salesforce",
    },
    {
      name: "Salesforce Platform Developer I",
      issuer: "Salesforce",
    },
    {
      name: "Salesforce Javascript Developer",
      issuer: "Salesforce",
    },
  ],
  skills: {
    // salesforce: [
    //   "Apex",
    //   "Lightning Web Components (LWC)",
    //   "Apex Triggers",
    //   "Salesforce Flow",
    //   "Salesforce REST API",
    //   "OAuth",

    // ],
    skills: ["MERN Stack", "Azure", "Zoho CRM", "Microsoft 365", "Fast API"],
    programming: ["JavaScript", "React", "HTML", "CSS"],
    databases: ["MongoDB"],
    other: ["Git", "Firebase"],
  },
  // projects: [
  //   {
  //     name: "Salesforce CRUD Application",
  //     description:
  //       "A full-stack application that connects to Salesforce and allows users to perform CRUD operations on Salesforce records.",
  //     technologies: [
  //       "React",
  //       "Vite",
  //       "Node.js",
  //       "Express.js",
  //       "Salesforce REST API",
  //       "OAuth",
  //     ],
  //     features: [
  //       "Salesforce OAuth authentication",
  //       "Dynamic object selection",
  //       "CRUD operations for Account, Opportunity, Lead, Contact and Case",
  //       "Record pagination",
  //       "React frontend deployed using GitHub Pages",
  //       "Node.js backend deployed using Render",
  //     ],
  //     outcome: "Successfully deployed and tested the application.",
  //   },
  //   {
  //     name: "Role Hierarchy and Security",
  //     description:
  //       "Salesforce project exploring role hierarchy and record-level access control.",
  //     technologies: ["Salesforce", "Role Hierarchy", "Security"],
  //     features: [],
  //     outcome: "",
  //   },
  //   {
  //     name: "Lead-to-Opportunity Automation",
  //     description:
  //       "Salesforce automation project focused on managing the lead-to-opportunity process.",
  //     technologies: ["Salesforce", "Salesforce Flow"],
  //     features: [],
  //     outcome: "",
  //   },
  //   {
  //     name: "Apex and LWC Custom Application",
  //     description:
  //       "Custom Salesforce application developed using Apex and Lightning Web Components.",
  //     technologies: ["Apex", "Lightning Web Components"],
  //     features: [],
  //     outcome: "",
  //   },
  // ],

  projects: [
    {
      name: "MERN Stack application using Azure",
      desc: "A simple notes app",
      tech: ["React", "Express", "MongoDB"],
    },
  ],
  experience: ["Front End Developer", "Cloud Internship"],
  hobbies: ["Coding", "Gym", "Guitar"],
  interests: ["Azure", "React", "MERN Stack"],
};
export default candidateProfile;

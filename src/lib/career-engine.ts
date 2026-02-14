import type { ProfileData, DreamRole, SkillGap, Roadmap, RoadmapDay, Skill } from "./career-context";

// Skill taxonomy database
const SKILL_TAXONOMY: Record<string, { category: "technical" | "soft" | "domain"; keywords: string[] }> = {
  "JavaScript": { category: "technical", keywords: ["javascript", "js", "es6", "es2015", "ecmascript", "node.js", "nodejs"] },
  "TypeScript": { category: "technical", keywords: ["typescript", "ts"] },
  "Python": { category: "technical", keywords: ["python", "py", "django", "flask", "fastapi"] },
  "React": { category: "technical", keywords: ["react", "reactjs", "react.js", "next.js", "nextjs", "redux"] },
  "Vue.js": { category: "technical", keywords: ["vue", "vuejs", "vue.js", "nuxt", "vuex"] },
  "Angular": { category: "technical", keywords: ["angular", "angularjs", "rxjs"] },
  "Node.js": { category: "technical", keywords: ["node", "nodejs", "node.js", "express", "expressjs", "nestjs"] },
  "SQL": { category: "technical", keywords: ["sql", "mysql", "postgresql", "postgres", "sqlite", "database"] },
  "NoSQL": { category: "technical", keywords: ["nosql", "mongodb", "mongo", "dynamodb", "cassandra", "redis", "firebase"] },
  "AWS": { category: "technical", keywords: ["aws", "amazon web services", "ec2", "s3", "lambda", "cloudformation"] },
  "Docker": { category: "technical", keywords: ["docker", "dockerfile", "container", "containerization"] },
  "Kubernetes": { category: "technical", keywords: ["kubernetes", "k8s", "helm", "kubectl"] },
  "Git": { category: "technical", keywords: ["git", "github", "gitlab", "version control", "bitbucket"] },
  "CI/CD": { category: "technical", keywords: ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "circleci"] },
  "Machine Learning": { category: "technical", keywords: ["machine learning", "ml", "deep learning", "tensorflow", "pytorch", "scikit-learn", "neural network"] },
  "Data Science": { category: "technical", keywords: ["data science", "pandas", "numpy", "jupyter", "data analysis", "statistics"] },
  "Java": { category: "technical", keywords: ["java", "spring", "spring boot", "jvm", "maven", "gradle"] },
  "C++": { category: "technical", keywords: ["c++", "cpp", "c plus plus"] },
  "Rust": { category: "technical", keywords: ["rust", "cargo", "rustlang"] },
  "Go": { category: "technical", keywords: ["go", "golang", "gin"] },
  "Swift": { category: "technical", keywords: ["swift", "swiftui", "ios development"] },
  "Kotlin": { category: "technical", keywords: ["kotlin", "android development"] },
  "GraphQL": { category: "technical", keywords: ["graphql", "apollo", "hasura"] },
  "REST API": { category: "technical", keywords: ["rest", "restful", "api design", "rest api", "openapi", "swagger"] },
  "CSS/Styling": { category: "technical", keywords: ["css", "sass", "scss", "less", "tailwind", "styled-components", "css-in-js"] },
  "HTML": { category: "technical", keywords: ["html", "html5", "semantic html", "web accessibility", "a11y"] },
  "Testing": { category: "technical", keywords: ["testing", "jest", "mocha", "cypress", "playwright", "unit test", "tdd", "bdd"] },
  "DevOps": { category: "technical", keywords: ["devops", "infrastructure", "terraform", "ansible", "puppet"] },
  "System Design": { category: "technical", keywords: ["system design", "architecture", "microservices", "distributed systems", "scalability"] },
  "Cybersecurity": { category: "technical", keywords: ["security", "cybersecurity", "owasp", "penetration testing", "encryption"] },
  "Communication": { category: "soft", keywords: ["communication", "presentation", "public speaking", "written communication"] },
  "Leadership": { category: "soft", keywords: ["leadership", "team lead", "management", "mentoring", "coaching"] },
  "Problem Solving": { category: "soft", keywords: ["problem solving", "critical thinking", "analytical", "debugging"] },
  "Teamwork": { category: "soft", keywords: ["teamwork", "collaboration", "team player", "cross-functional"] },
  "Project Management": { category: "soft", keywords: ["project management", "agile", "scrum", "kanban", "jira"] },
  "Time Management": { category: "soft", keywords: ["time management", "prioritization", "organization", "deadline"] },
  "Adaptability": { category: "soft", keywords: ["adaptability", "flexibility", "fast learner", "quick learner"] },
  "Product Thinking": { category: "domain", keywords: ["product", "product management", "user stories", "roadmap", "stakeholder"] },
  "UX/UI Design": { category: "domain", keywords: ["ux", "ui", "user experience", "user interface", "figma", "sketch", "design"] },
  "Data Engineering": { category: "domain", keywords: ["data engineering", "etl", "data pipeline", "airflow", "spark", "kafka"] },
  "Cloud Architecture": { category: "domain", keywords: ["cloud", "cloud architecture", "multi-cloud", "hybrid cloud", "gcp", "azure"] },
  "Blockchain": { category: "domain", keywords: ["blockchain", "web3", "smart contract", "solidity", "ethereum"] },
  "AI/NLP": { category: "domain", keywords: ["ai", "artificial intelligence", "nlp", "natural language processing", "llm", "gpt", "transformer"] },
};

// Dream role templates
export const ROLE_TEMPLATES: Record<string, { requiredSkills: { name: string; level: Skill["level"] }[]; description: string; salaryRange: string; demandLevel: DreamRole["demandLevel"] }> = {
  "Frontend Engineer": {
    requiredSkills: [
      { name: "JavaScript", level: "advanced" },
      { name: "TypeScript", level: "intermediate" },
      { name: "React", level: "advanced" },
      { name: "CSS/Styling", level: "advanced" },
      { name: "HTML", level: "advanced" },
      { name: "Testing", level: "intermediate" },
      { name: "Git", level: "intermediate" },
      { name: "REST API", level: "intermediate" },
      { name: "System Design", level: "beginner" },
      { name: "Communication", level: "intermediate" },
      { name: "Problem Solving", level: "intermediate" },
    ],
    description: "Build beautiful, performant user interfaces and web applications",
    salaryRange: "$90K - $160K",
    demandLevel: "high",
  },
  "Backend Engineer": {
    requiredSkills: [
      { name: "Node.js", level: "advanced" },
      { name: "Python", level: "intermediate" },
      { name: "SQL", level: "advanced" },
      { name: "NoSQL", level: "intermediate" },
      { name: "REST API", level: "advanced" },
      { name: "Docker", level: "intermediate" },
      { name: "Git", level: "intermediate" },
      { name: "Testing", level: "intermediate" },
      { name: "System Design", level: "intermediate" },
      { name: "CI/CD", level: "beginner" },
      { name: "Problem Solving", level: "advanced" },
    ],
    description: "Design and implement server-side logic, APIs, and database systems",
    salaryRange: "$100K - $170K",
    demandLevel: "high",
  },
  "Full Stack Developer": {
    requiredSkills: [
      { name: "JavaScript", level: "advanced" },
      { name: "TypeScript", level: "intermediate" },
      { name: "React", level: "intermediate" },
      { name: "Node.js", level: "intermediate" },
      { name: "SQL", level: "intermediate" },
      { name: "CSS/Styling", level: "intermediate" },
      { name: "Git", level: "intermediate" },
      { name: "Docker", level: "beginner" },
      { name: "REST API", level: "intermediate" },
      { name: "Testing", level: "intermediate" },
      { name: "Problem Solving", level: "intermediate" },
      { name: "Communication", level: "intermediate" },
    ],
    description: "Develop both client and server-side of web applications end-to-end",
    salaryRange: "$95K - $165K",
    demandLevel: "high",
  },
  "Data Scientist": {
    requiredSkills: [
      { name: "Python", level: "advanced" },
      { name: "Machine Learning", level: "advanced" },
      { name: "Data Science", level: "advanced" },
      { name: "SQL", level: "intermediate" },
      { name: "Communication", level: "intermediate" },
      { name: "Problem Solving", level: "advanced" },
      { name: "AI/NLP", level: "intermediate" },
      { name: "Git", level: "beginner" },
    ],
    description: "Extract insights from data using statistical analysis and machine learning",
    salaryRange: "$110K - $180K",
    demandLevel: "high",
  },
  "ML Engineer": {
    requiredSkills: [
      { name: "Python", level: "advanced" },
      { name: "Machine Learning", level: "advanced" },
      { name: "Docker", level: "intermediate" },
      { name: "AWS", level: "intermediate" },
      { name: "System Design", level: "intermediate" },
      { name: "CI/CD", level: "intermediate" },
      { name: "Data Science", level: "intermediate" },
      { name: "AI/NLP", level: "advanced" },
      { name: "Git", level: "intermediate" },
      { name: "Problem Solving", level: "advanced" },
    ],
    description: "Build and deploy machine learning models at scale in production systems",
    salaryRange: "$130K - $200K",
    demandLevel: "high",
  },
  "DevOps Engineer": {
    requiredSkills: [
      { name: "Docker", level: "advanced" },
      { name: "Kubernetes", level: "advanced" },
      { name: "AWS", level: "advanced" },
      { name: "CI/CD", level: "advanced" },
      { name: "DevOps", level: "advanced" },
      { name: "Python", level: "intermediate" },
      { name: "Git", level: "advanced" },
      { name: "System Design", level: "intermediate" },
      { name: "Cybersecurity", level: "beginner" },
      { name: "Problem Solving", level: "intermediate" },
    ],
    description: "Automate infrastructure, deployments, and ensure system reliability",
    salaryRange: "$105K - $175K",
    demandLevel: "high",
  },
  "Product Manager": {
    requiredSkills: [
      { name: "Product Thinking", level: "advanced" },
      { name: "Communication", level: "advanced" },
      { name: "Leadership", level: "intermediate" },
      { name: "Project Management", level: "advanced" },
      { name: "UX/UI Design", level: "intermediate" },
      { name: "Data Science", level: "beginner" },
      { name: "Problem Solving", level: "advanced" },
      { name: "Teamwork", level: "advanced" },
    ],
    description: "Define product strategy and lead cross-functional teams to deliver value",
    salaryRange: "$110K - $180K",
    demandLevel: "medium",
  },
  "Cloud Architect": {
    requiredSkills: [
      { name: "AWS", level: "advanced" },
      { name: "Cloud Architecture", level: "advanced" },
      { name: "Docker", level: "advanced" },
      { name: "Kubernetes", level: "intermediate" },
      { name: "System Design", level: "advanced" },
      { name: "DevOps", level: "intermediate" },
      { name: "Cybersecurity", level: "intermediate" },
      { name: "Communication", level: "intermediate" },
      { name: "Problem Solving", level: "advanced" },
    ],
    description: "Design and oversee cloud computing strategies and architecture",
    salaryRange: "$140K - $220K",
    demandLevel: "high",
  },
  "Mobile Developer": {
    requiredSkills: [
      { name: "Swift", level: "advanced" },
      { name: "Kotlin", level: "advanced" },
      { name: "React", level: "intermediate" },
      { name: "JavaScript", level: "intermediate" },
      { name: "REST API", level: "intermediate" },
      { name: "Git", level: "intermediate" },
      { name: "Testing", level: "intermediate" },
      { name: "UX/UI Design", level: "beginner" },
      { name: "Problem Solving", level: "intermediate" },
    ],
    description: "Build native and cross-platform mobile applications for iOS and Android",
    salaryRange: "$95K - $165K",
    demandLevel: "high",
  },
  "Cybersecurity Analyst": {
    requiredSkills: [
      { name: "Cybersecurity", level: "advanced" },
      { name: "Python", level: "intermediate" },
      { name: "DevOps", level: "beginner" },
      { name: "AWS", level: "intermediate" },
      { name: "System Design", level: "intermediate" },
      { name: "Communication", level: "intermediate" },
      { name: "Problem Solving", level: "advanced" },
    ],
    description: "Protect organizations from cyber threats and security vulnerabilities",
    salaryRange: "$85K - $150K",
    demandLevel: "high",
  },
};

const LEVEL_MAP: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
const LEVEL_REVERSE: Record<number, Skill["level"]> = { 1: "beginner", 2: "intermediate", 3: "advanced", 4: "expert" };

// Extract skills from unstructured text
export function extractSkillsFromText(text: string): Skill[] {
  const normalizedText = text.toLowerCase();
  const foundSkills: Skill[] = [];

  for (const [skillName, config] of Object.entries(SKILL_TAXONOMY)) {
    const found = config.keywords.some((kw) => normalizedText.includes(kw));
    if (found) {
      // Estimate level based on frequency and context
      let level: Skill["level"] = "beginner";
      const mentionCount = config.keywords.reduce((count, kw) => {
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        return count + (normalizedText.match(regex)?.length || 0);
      }, 0);

      if (mentionCount >= 5) level = "advanced";
      else if (mentionCount >= 3) level = "intermediate";

      // Check for experience indicators
      if (/(\d+)\+?\s*years?\s*(of\s*)?(experience\s*(in|with))?\s*/i.test(text)) {
        const yearsMatch = text.match(/(\d+)\+?\s*years?/);
        if (yearsMatch) {
          const years = parseInt(yearsMatch[1]);
          if (years >= 5) level = "expert";
          else if (years >= 3) level = "advanced";
          else if (years >= 1) level = "intermediate";
        }
      }

      foundSkills.push({ name: skillName, level, category: config.category });
    }
  }

  return foundSkills;
}

// Analyze skill gaps between profile and dream role
export function analyzeSkillGaps(profileSkills: Skill[], dreamRole: DreamRole): SkillGap[] {
  const profileSkillMap = new Map<string, number>();
  profileSkills.forEach((s) => {
    profileSkillMap.set(s.name, LEVEL_MAP[s.level] || 0);
  });

  const gaps: SkillGap[] = dreamRole.requiredSkills.map((required) => {
    const currentLevel = profileSkillMap.get(required.name) || 0;
    const requiredLevel = LEVEL_MAP[required.level] || 2;
    const gap = Math.max(0, requiredLevel - currentLevel);

    let priority: SkillGap["priority"] = "nice-to-have";
    if (gap >= 2) priority = "critical";
    else if (gap >= 1) priority = "important";

    return {
      skill: required.name,
      currentLevel,
      requiredLevel,
      gap,
      category: required.category || "technical",
      priority,
    };
  });

  return gaps.sort((a, b) => b.gap - a.gap);
}

// Resource library
const LEARNING_RESOURCES: Record<string, { title: string; url: string; type: string }[]> = {
  "JavaScript": [
    { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "Documentation" },
    { title: "JavaScript.info", url: "https://javascript.info", type: "Tutorial" },
    { title: "Eloquent JavaScript", url: "https://eloquentjavascript.net", type: "Book" },
  ],
  "TypeScript": [
    { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "Documentation" },
    { title: "Total TypeScript", url: "https://www.totaltypescript.com", type: "Course" },
  ],
  "React": [
    { title: "React Official Docs", url: "https://react.dev", type: "Documentation" },
    { title: "React Patterns", url: "https://reactpatterns.com", type: "Guide" },
  ],
  "Python": [
    { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", type: "Documentation" },
    { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com", type: "Book" },
  ],
  "SQL": [
    { title: "SQLBolt", url: "https://sqlbolt.com", type: "Interactive" },
    { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com", type: "Tutorial" },
  ],
  "Docker": [
    { title: "Docker Getting Started", url: "https://docs.docker.com/get-started/", type: "Documentation" },
    { title: "Docker Curriculum", url: "https://docker-curriculum.com", type: "Tutorial" },
  ],
  "AWS": [
    { title: "AWS Free Training", url: "https://aws.amazon.com/training/", type: "Course" },
    { title: "AWS Well-Architected", url: "https://aws.amazon.com/architecture/well-architected/", type: "Guide" },
  ],
  "Machine Learning": [
    { title: "fast.ai", url: "https://www.fast.ai", type: "Course" },
    { title: "Andrew Ng ML Course", url: "https://www.coursera.org/learn/machine-learning", type: "Course" },
  ],
  "Git": [
    { title: "Pro Git Book", url: "https://git-scm.com/book", type: "Book" },
    { title: "Learn Git Branching", url: "https://learngitbranching.js.org", type: "Interactive" },
  ],
  "System Design": [
    { title: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "Guide" },
    { title: "Designing Data-Intensive Applications", url: "https://dataintensive.net", type: "Book" },
  ],
};

// Project ideas per skill
const PROJECT_IDEAS: Record<string, string[]> = {
  "JavaScript": ["Build a real-time chat app", "Create a task management CLI tool", "Build a browser extension"],
  "TypeScript": ["Migrate a JS project to TypeScript", "Build a type-safe API client", "Create a generic utility library"],
  "React": ["Build a dashboard with data visualization", "Create a social media feed", "Build an e-commerce product page"],
  "Python": ["Build a web scraper", "Create a REST API with FastAPI", "Build a data pipeline"],
  "SQL": ["Design a library management database", "Build complex reporting queries", "Optimize slow queries"],
  "Node.js": ["Build a REST API with Express", "Create a WebSocket server", "Build a job queue system"],
  "Docker": ["Containerize a full-stack app", "Create a multi-container setup", "Build a CI/CD pipeline"],
  "AWS": ["Deploy an app to EC2/ECS", "Set up a serverless API", "Create an S3 static website"],
  "Machine Learning": ["Build a sentiment analyzer", "Create an image classifier", "Build a recommendation system"],
  "Testing": ["Write unit tests for an existing project", "Set up E2E tests with Playwright", "Achieve 80%+ code coverage"],
  "Git": ["Practice rebasing and merge conflicts", "Set up a branching strategy", "Contribute to open source"],
  "System Design": ["Design a URL shortener", "Design a chat system", "Design a news feed"],
  "Communication": ["Write a technical blog post", "Present a tech topic to peers", "Document an open source project"],
  "Leadership": ["Mentor a junior developer", "Lead a code review session", "Organize a team retrospective"],
  "Problem Solving": ["Solve 30 LeetCode problems", "Complete a coding challenge", "Debug a complex production issue"],
};

// Generate a 30-day personalized roadmap
export function generateRoadmap(skillGaps: SkillGap[], profile: ProfileData, dreamRole: DreamRole): Roadmap {
  const criticalGaps = skillGaps.filter((g) => g.priority === "critical" && g.gap > 0);
  const importantGaps = skillGaps.filter((g) => g.priority === "important" && g.gap > 0);
  const niceToHaveGaps = skillGaps.filter((g) => g.priority === "nice-to-have" && g.gap > 0);

  const allGaps = [...criticalGaps, ...importantGaps, ...niceToHaveGaps];
  const days: RoadmapDay[] = [];

  const weeklyGoals = [
    "Foundation: Assess current skills and set up learning environment",
    "Core Skills: Deep dive into critical skill gaps",
    "Applied Learning: Build projects and practice",
    "Integration: Combine skills and prepare for roles",
  ];

  const milestones = [
    { day: 7, title: "Week 1 Complete", description: "Foundation skills assessed and learning environment ready" },
    { day: 14, title: "Mid-Point Check", description: "Core technical skills progressing, first project started" },
    { day: 21, title: "Week 3 Complete", description: "Applied learning projects completed, portfolio updated" },
    { day: 30, title: "Roadmap Complete", description: "All skill gaps addressed, ready for applications" },
  ];

  for (let day = 1; day <= 30; day++) {
    const week = Math.ceil(day / 7);
    const dayInWeek = ((day - 1) % 7) + 1;
    const isCheckpoint = day === 7 || day === 14 || day === 21 || day === 30;

    // Distribute gaps across days
    const gapIndex = (day - 1) % Math.max(allGaps.length, 1);
    const currentGap = allGaps[gapIndex] || allGaps[0];

    if (!currentGap) {
      days.push({
        day,
        week,
        title: "Review & Practice",
        description: "Review what you have learned and practice with coding challenges",
        tasks: ["Review notes from previous days", "Practice coding challenges", "Update your portfolio"],
        resources: [],
        skillFocus: "General",
        estimatedHours: 1.5,
        completed: false,
        checkpoint: isCheckpoint,
      });
      continue;
    }

    const skillResources = LEARNING_RESOURCES[currentGap.skill] || [];
    const projects = PROJECT_IDEAS[currentGap.skill] || [];
    const resourceUrls = skillResources.map((r) => `${r.title} (${r.type}): ${r.url}`);

    let title = "";
    let description = "";
    let tasks: string[] = [];
    let hours = 2;

    if (week === 1) {
      // Week 1: Foundation and assessment
      if (dayInWeek <= 2) {
        title = `Assess & Learn: ${currentGap.skill}`;
        description = `Evaluate your current ${currentGap.skill} knowledge and begin structured learning`;
        tasks = [
          `Complete a self-assessment quiz on ${currentGap.skill}`,
          `Read introductory documentation for ${currentGap.skill}`,
          `Set up a practice environment for ${currentGap.skill}`,
          `Follow a beginner tutorial to refresh fundamentals`,
        ];
        hours = 2;
      } else {
        title = `Deep Dive: ${currentGap.skill} Fundamentals`;
        description = `Build strong foundations in ${currentGap.skill} through hands-on exercises`;
        tasks = [
          `Complete intermediate exercises in ${currentGap.skill}`,
          `Build a small practice project using ${currentGap.skill}`,
          `Take notes on key concepts and patterns`,
        ];
        hours = 2.5;
      }
    } else if (week === 2) {
      // Week 2: Core skills development
      title = `Build Skills: ${currentGap.skill}`;
      description = `Advance your ${currentGap.skill} proficiency through practice and projects`;
      tasks = [
        `Work through advanced tutorials on ${currentGap.skill}`,
        projects[0] ? `Start project: ${projects[0]}` : `Practice ${currentGap.skill} exercises`,
        `Study best practices and common patterns`,
        `Review and refactor previous code`,
      ];
      hours = 3;
    } else if (week === 3) {
      // Week 3: Applied learning
      title = `Apply: ${currentGap.skill} in Practice`;
      description = `Apply ${currentGap.skill} in realistic project scenarios`;
      tasks = [
        projects[1] ? `Continue project: ${projects[1]}` : `Build a portfolio piece using ${currentGap.skill}`,
        `Integrate ${currentGap.skill} with other tools you have learned`,
        `Write documentation for your project`,
        `Get feedback from the community or peers`,
      ];
      hours = 3;
    } else {
      // Week 4+: Integration and preparation
      title = `Master & Integrate: ${currentGap.skill}`;
      description = `Combine ${currentGap.skill} with other competencies and prepare for ${dreamRole.title} role`;
      tasks = [
        `Complete a capstone exercise combining ${currentGap.skill} with other skills`,
        `Prepare to discuss ${currentGap.skill} in interviews`,
        `Polish portfolio projects demonstrating ${currentGap.skill}`,
        `Review ${dreamRole.title} job descriptions and align your profile`,
      ];
      hours = 2.5;
    }

    days.push({
      day,
      week,
      title,
      description,
      tasks,
      resources: resourceUrls.slice(0, 3),
      skillFocus: currentGap.skill,
      estimatedHours: hours,
      completed: false,
      checkpoint: isCheckpoint,
    });
  }

  const totalHours = days.reduce((sum, d) => sum + d.estimatedHours, 0);

  return { days, totalHours, weeklyGoals, milestones };
}

export function getLevelLabel(level: number): string {
  return LEVEL_REVERSE[level] || "none";
}

export function getSkillColor(category: string): string {
  switch (category) {
    case "technical": return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "soft": return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
    case "domain": return "bg-purple-500/10 text-purple-700 border-purple-200";
    default: return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical": return "bg-red-500/10 text-red-700 border-red-300";
    case "important": return "bg-amber-500/10 text-amber-700 border-amber-300";
    case "nice-to-have": return "bg-green-500/10 text-green-700 border-green-300";
    default: return "bg-gray-500/10 text-gray-700 border-gray-300";
  }
}

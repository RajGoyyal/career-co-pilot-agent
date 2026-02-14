"use client";

import { useState } from "react";
import { useCareer } from "@/lib/career-context";
import { extractSkillsFromText } from "@/lib/career-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Sparkles,
  User,
  Compass,
  Upload,
} from "lucide-react";
import { getSkillColor } from "@/lib/career-engine";
import type { Skill } from "@/lib/career-context";
import { buildResumeInsights, deriveProfileDetails } from "@/lib/resume-parser";

export default function ProfileStep() {
  const { setCurrentStep, setProfile } = useCareer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractSkills = () => {
    setIsExtracting(true);
    // Simulate agent processing delay
    setTimeout(() => {
      const allText = [resumeText, experience, education, githubUrl, linkedinUrl].join(" ");
      const skills = extractSkillsFromText(allText);
      setExtractedSkills(skills);
      setIsExtracting(false);
    }, 1200);
  };

  const handleContinue = () => {
    const allText = [resumeText, experience, education].join(" ");
    const skills = extractedSkills.length > 0 ? extractedSkills : extractSkillsFromText(allText);

    const combinedText = [resumeText, experience, education].filter(Boolean).join("\n\n");
    const derived = deriveProfileDetails(combinedText || allText);
    const insights = buildResumeInsights({
      text: combinedText || allText,
      skills,
      derived,
      overrides: {
        name: name || undefined,
        email: email || undefined,
        linkedin: linkedinUrl || undefined,
        github: githubUrl || undefined,
        experienceSummary: experience || undefined,
        educationSummary: education || undefined,
      },
    });

    setProfile({
      name: name || "Student",
      email,
      resumeText,
      githubUrl,
      linkedinUrl,
      extractedSkills: skills,
      experience,
      education,
      insights,
    });
    setCurrentStep("dream-role");
  };

  const hasContent = resumeText.trim().length > 0 || experience.trim().length > 0;

  const sampleResume = `Software Developer with 2 years of experience in web development.

Skills: JavaScript, TypeScript, React, Node.js, Python, SQL, Git, Docker, REST APIs, HTML, CSS, Tailwind CSS

Experience:
- Built full-stack web applications using React and Node.js
- Developed REST APIs with Express and PostgreSQL
- Implemented CI/CD pipelines using GitHub Actions
- Collaborated in agile teams using Scrum methodology
- Worked with AWS services including EC2, S3, and Lambda

Education:
- B.S. Computer Science, State University
- Relevant coursework: Data Structures, Algorithms, Database Systems, Machine Learning

Projects:
- E-commerce platform with React, Node.js, and PostgreSQL
- Real-time chat application using WebSockets
- Machine learning model for sentiment analysis using Python and scikit-learn`;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Career Navigator</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</div>
            Profile
            <ArrowRight className="h-4 w-4 mx-1" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">2</div>
            Dream Role
            <ArrowRight className="h-4 w-4 mx-1" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">3</div>
            Analysis
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => setCurrentStep("landing")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tell Us About Yourself</h1>
          <p className="mt-2 text-muted-foreground">
            Paste your resume, share your profiles, and let the AI agent extract your skills.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Resume / Profile Content
              </CardTitle>
              <CardDescription>
                Paste your resume text, cover letter, or any professional summary. The more detail, the better the analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResumeText(sampleResume)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Load Sample Resume
              </Button>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Github className="h-5 w-5 text-primary" />
                Profile Links
              </CardTitle>
              <CardDescription>Optional: Help the agent understand your full profile</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="github" className="flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5" /> GitHub URL
                </Label>
                <Input id="github" placeholder="https://github.com/username" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn URL
                </Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="mt-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Experience & Education */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Context</CardTitle>
              <CardDescription>Help the agent personalize your roadmap</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="experience">Experience Summary</Label>
                <Textarea id="experience" placeholder="Brief description of your work experience..." value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1.5 min-h-[100px]" />
              </div>
              <div>
                <Label htmlFor="education">Education</Label>
                <Textarea id="education" placeholder="Your educational background..." value={education} onChange={(e) => setEducation(e.target.value)} className="mt-1.5 min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          {/* Skill Extraction */}
          {hasContent && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Skill Extraction
                </CardTitle>
                <CardDescription>
                  Let the agent analyze your profile and extract structured skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExtractSkills}
                  disabled={isExtracting}
                  variant="outline"
                  className="border-primary/30 hover:bg-primary/5"
                >
                  {isExtracting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Extracting Skills...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Extract Skills from Profile
                    </>
                  )}
                </Button>

                {extractedSkills.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      Found {extractedSkills.length} skills:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant="outline"
                          className={`${getSkillColor(skill.category)} px-3 py-1`}
                        >
                          {skill.name}
                          <span className="ml-1.5 opacity-60 text-xs">({skill.level})</span>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500" /> Technical
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" /> Soft Skills
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-purple-500" /> Domain
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCurrentStep("landing")}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={!hasContent}>
              Continue to Dream Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

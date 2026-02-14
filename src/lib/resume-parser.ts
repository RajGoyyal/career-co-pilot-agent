import type { Skill } from "./career-context";
import { extractSkillsFromText } from "./career-engine";

interface SectionConfig {
  key: keyof DerivedProfileFields;
  labels: string[];
}

export interface DerivedProfileFields {
  name?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  experienceSummary?: string;
  educationSummary?: string;
}

const SECTION_CONFIG: SectionConfig[] = [
  { key: "experienceSummary", labels: ["professional experience", "experience", "work experience"] },
  { key: "educationSummary", labels: ["education", "academic", "studies"] },
];

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";
const PDF_MIME = "application/pdf";
const JSON_MIME = "application/json";

type SupportedFormat = "pdf" | "docx" | "doc" | "json" | "text";

export interface ResumeAnalysisResult {
  text: string;
  derived: DerivedProfileFields;
  skills: Skill[];
  format: SupportedFormat;
}

function cleanResumeText(input: string): string {
  return input
    .replace(/\u0000|\f|\r/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSectionSnippet(text: string, variants: string[], snippetSize = 800): string | undefined {
  const lowered = text.toLowerCase();
  for (const label of variants) {
    const index = lowered.indexOf(label);
    if (index !== -1) {
      const slice = text.slice(index, index + snippetSize);
      return slice.split(/\n{2,}/)[0]?.trim();
    }
  }
  return undefined;
}

export function deriveProfileDetails(rawText: string): DerivedProfileFields {
  const text = rawText.replace(/\r/g, " ");
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[\w\-\/()]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[\w\-\/()]+/i);

  let name: string | undefined;
  if (lines.length > 0) {
    const candidate = lines[0];
    if (/^[A-Za-zÀ-ÿ ,.'-]{3,60}$/.test(candidate) && candidate.split(" ").length <= 6) {
      name = candidate;
    }
  }

  const extracted: DerivedProfileFields = {
    name,
    email: emailMatch?.[0],
    linkedin: linkedinMatch?.[0],
    github: githubMatch?.[0],
  };

  for (const section of SECTION_CONFIG) {
    const snippet = extractSectionSnippet(text, section.labels);
    if (snippet) {
      extracted[section.key] = snippet;
    }
  }

  return extracted;
}

function getExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let combinedText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    combinedText += `${pageText}\n`;
  }

  return cleanResumeText(combinedText);
}

async function extractDocxText(file: File): Promise<string> {
  const { extractRawText } = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await extractRawText({ arrayBuffer });
  return cleanResumeText(result.value ?? "");
}

async function extractJsonText(file: File): Promise<string> {
  const raw = await file.text();
  try {
    const data = JSON.parse(raw);
    const collected = collectStrings(data);
    return cleanResumeText(collected.join("\n"));
  } catch {
    return cleanResumeText(raw);
  }
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist/build/pdf")> | null = null;
let pdfWorkerInitialized = false;

async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/build/pdf");
  }
  const pdfjsLib = await pdfjsLibPromise;
  if (!pdfWorkerInitialized) {
    const workerModule = await import("pdfjs-dist/build/pdf.worker.entry");
    const workerSrc = (workerModule as { default?: string }).default ?? (workerModule as unknown as string);
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    }
    pdfWorkerInitialized = true;
  }
  return pdfjsLib;
}

function detectFormat(file: File): SupportedFormat {
  const type = file.type.toLowerCase();
  const ext = getExtension(file.name);

  if (type === PDF_MIME || ext === "pdf") return "pdf";
  if (type === DOCX_MIME || ext === "docx") return "docx";
  if (type === DOC_MIME || ext === "doc") return "doc";
  if (type === JSON_MIME || ext === "json") return "json";
  return "text";
}

export async function analyzeResumeFile(file: File): Promise<ResumeAnalysisResult> {
  const format = detectFormat(file);

  if (format === "doc") {
    throw new Error("Legacy .doc files are not supported. Please save your resume as .docx or PDF.");
  }

  let text: string;

  switch (format) {
    case "pdf":
      text = await extractPdfText(file);
      break;
    case "docx":
      text = await extractDocxText(file);
      break;
    case "json":
      text = await extractJsonText(file);
      break;
    default:
      text = cleanResumeText(await file.text());
      break;
  }

  if (!text) {
    throw new Error("We couldn't read any text from that file.");
  }

  const derived = deriveProfileDetails(text);
  const skills = extractSkillsFromText(text);

  return {
    text,
    derived,
    skills,
    format,
  };
}

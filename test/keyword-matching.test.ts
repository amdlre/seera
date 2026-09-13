import { describe, expect, it } from "vitest";
import type { ResumeSection } from "@/db/schema";
import { analyzeKeywords, scoreKeywords } from "@/lib/ats/keywords";
import { findTerms } from "@/lib/ats/term-matcher";
import { normalizeText } from "@/lib/ats/text-normalize";
import type { AtsScoreInput } from "@/lib/ats/types";
import { VOCABULARY } from "@/lib/ats/vocabulary";

/** The exact posting a user pasted, where the old frequency-based extractor surfaced "job", "such" and "strong". */
const FRONTEND_POSTING = `Job Description
We are looking for a skilled Front-End Developer who specializes in React.js development. The ideal candidate will be responsible for building interactive, user-friendly interfaces that engage our users and enhance their overall experience. You will collaborate closely with our design and back-end teams to translate UI/UX designs into high-quality code, ensuring seamless integration with our existing systems.
Job Responsibilities
Develop responsive web applications using React.js and other modern front-end technologies
Collaborate with designers and back-end developers to implement user-friendly interfaces that meet design specifications and project requirements
Optimize application performance for maximum speed and scalability
Write clean, maintainable code and adhere to best practices in software development
Conduct thorough code reviews to ensure code quality and adherence to coding standards
Troubleshoot and debug issues to maintain and improve application functionality
Stay updated on emerging front-end technologies and industry trends to continuously improve our development processes and products
Requirements
Proven experience as a Front-End Developer with a focus on React.js development
Strong proficiency in JavaScript, HTML, CSS, and related web technologies
Experience with state management libraries such as Redux or MobX
Familiarity with RESTful APIs and asynchronous request handling
Knowledge of front-end build tools such as Webpack, Babel, and npm
Understanding of version control systems, particularly Git
Excellent communication and collaboration skills
Strong problem-solving abilities and attention to detail
Ability to work effectively in a fast-paced, dynamic environment
Knowledge of UX design principles and techniques
Experience working in an Agile/Scrum environment`;

const ids = (text: string) => [...findTerms(text).keys()];

function makeSection(type: string): ResumeSection {
  return {
    id: `section-${type}`,
    resumeId: "resume-1",
    type: type as ResumeSection["type"],
    titleAr: type,
    titleEn: type,
    layout: "paragraph",
    sortOrder: 0,
    isVisible: true,
    isCustom: false,
  };
}

function resumeWith(skillsEn: string, extra: Partial<AtsScoreInput> = {}): AtsScoreInput {
  return {
    personalInfo: { portfolioUrl: "github.com/someone" },
    summary: {},
    sections: [makeSection("skills")],
    itemsBySectionId: { "section-skills": [{ id: "s1", data: { categoryEn: "Skills", skillsEn } }] },
    jobPostingText: FRONTEND_POSTING,
    ...extra,
  };
}

describe("vocabulary integrity", () => {
  it("has unique term ids", () => {
    const all = VOCABULARY.map((term) => term.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it("never lets an alias normalize to an empty string", () => {
    for (const term of VOCABULARY) expect(term.normalizedAliases.length).toBeGreaterThan(0);
  });
});

describe("normalizeText", () => {
  it("unifies punctuation variants of the same term", () => {
    expect(normalizeText("React.js")).toBe(normalizeText("react-js"));
  });

  it("unifies Arabic alef, ta-marbuta and diacritic variants", () => {
    expect(normalizeText("الإدارةُ")).toBe(normalizeText("الادارة"));
  });
});

describe("findTerms — precision", () => {
  it("does not match Java inside JavaScript", () => {
    expect(ids("5 years of JavaScript")).not.toContain("java");
  });

  it("treats React, React.js and ReactJS as one term", () => {
    for (const text of ["React", "React.js", "ReactJS"]) expect(ids(text)).toEqual(["react"]);
  });

  it("counts UI/UX once, not also as UI and UX", () => {
    expect(ids("UI/UX designs")).toEqual(["ui-ux"]);
  });

  it("does not count React Native as React", () => {
    expect(ids("Built apps with React Native")).toEqual(["react-native"]);
  });

  it("counts plurals as the same term", () => {
    expect(ids("RESTful APIs")).toEqual(["rest-api"]);
  });

  it("matches Arabic terms with a leading conjunction", () => {
    expect(ids("مهارات والتواصل")).toContain("communication");
  });

  it("matches Latin terms glued to an Arabic conjunction", () => {
    expect(ids("خبرة في React وNext.js")).toEqual(expect.arrayContaining(["react", "nextjs"]));
  });

  it("ignores everyday words that the old extractor mistook for keywords", () => {
    expect(ids("We are hiring for this job, such a strong team with competitive compensation")).toEqual([]);
  });
});

describe("analyzeKeywords — the real posting", () => {
  const requested = ids(FRONTEND_POSTING);

  it("recognises the concrete skills the posting asks for", () => {
    expect(requested).toEqual(
      expect.arrayContaining([
        "react", "javascript", "html", "css", "redux", "mobx", "state-management",
        "rest-api", "webpack", "babel", "npm", "git", "version-control", "agile", "scrum",
        "ui-ux", "ux", "responsive-design", "code-review", "debugging",
        "performance-optimization", "best-practices", "communication", "collaboration",
        "problem-solving", "attention-to-detail", "adaptability",
      ]),
    );
  });

  it("does not report JavaScript's substring as a Java requirement", () => {
    expect(requested).not.toContain("java");
  });

  it("splits requested terms into matched and missing against the resume", () => {
    const analysis = analyzeKeywords(resumeWith("React, JavaScript, HTML, CSS, Git"));
    const matched = analysis.matched.map((match) => match.id);
    const missing = analysis.missing.map((match) => match.id);
    expect(matched).toEqual(expect.arrayContaining(["react", "javascript", "html", "css", "git"]));
    expect(missing).toEqual(expect.arrayContaining(["redux", "webpack", "agile"]));
    expect(matched.some((id) => missing.includes(id))).toBe(false);
  });

  it("does not treat a portfolio URL as the GitHub skill", () => {
    const analysis = analyzeKeywords(resumeWith("React", { jobPostingText: "Experience with GitHub" }));
    expect(analysis.missing.map((match) => match.id)).toContain("github");
  });

  it("orders missing terms by how often the posting mentions them", () => {
    const { missing } = analyzeKeywords(resumeWith("Python"));
    const counts = missing.map((match) => match.occurrences);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));

    const rank = (id: string) => missing.findIndex((match) => match.id === id);
    // React.js is named three times; Webpack once.
    expect(rank("react")).toBeLessThan(rank("webpack"));
  });
});

describe("scoreKeywords", () => {
  it("gives full points when no posting is pasted", () => {
    const result = scoreKeywords(resumeWith("React", { jobPostingText: "" }));
    expect(result.earned).toBe(15);
    expect(result.analysis.hasPosting).toBe(false);
  });

  it("gives full points when the posting names no recognisable skills", () => {
    const result = scoreKeywords(resumeWith("React", { jobPostingText: "We are a great company." }));
    expect(result.earned).toBe(15);
    expect(result.issues).toEqual([]);
  });

  it("scores more for a resume that covers more of the posting", () => {
    const weak = scoreKeywords(resumeWith("Python")).earned;
    const strong = scoreKeywords(
      resumeWith("React, JavaScript, HTML, CSS, Redux, Webpack, Git, Agile, Scrum, communication"),
    ).earned;
    expect(strong).toBeGreaterThan(weak);
  });
});

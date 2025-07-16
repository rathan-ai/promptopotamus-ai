export interface Certificate {
  slug: string;
  level: 'Beginner' | 'Intermediate' | 'Master';
  badgeName: string;
  description: string;
  criteria: string[];
  skills: string[];
}

export type QuizLevel = 'beginner' | 'intermediate' | 'master';

export const certificates: Record<string, Certificate> = {
  promptling: {
    slug: 'promptling',
    level: 'Beginner',
    badgeName: 'Promptling – AI Prompting Beginner',
    description: 'Awarded for foundational understanding of AI prompt engineering.',
    criteria: [
      'Completed the Level 1 Exam.',
      'Understanding prompt syntax, user intent, and goal-oriented design.',
    ],
    skills: ['Prompt engineering (beginner)', 'NLP fundamentals', 'Structured prompt writing'],
  },
  promptosaur: {
    slug: 'promptosaur',
    level: 'Intermediate',
    badgeName: 'Promptosaur – Intermediate Prompt Practitioner',
    description: 'Certifies intermediate-level proficiency in prompt engineering.',
    criteria: [
      'Earned by completing the Intermediate Exam.',
      'Creating reusable prompt templates and fine-tuning prompts.',
    ],
    skills: ['Intermediate prompt design', 'Prompt chaining', 'Context-aware interactions'],
  },
  promptopotamus: {
    slug: 'promptopotamus',
    level: 'Master',
    badgeName: 'Promptopotamus – Certified Prompt Master',
    description: 'The highest level of certification, awarded for mastery in prompt engineering.',
    criteria: [
      'Granted after completing the Mastery Exam.',
      'Designing end-to-end prompt workflows.',
    ],
    skills: ['Prompt architecture', 'Multi-agent prompt systems', 'AI prompt governance'],
  },
};

export const levelSlugs: Record<QuizLevel, string> = {
    beginner: 'promptling',
    intermediate: 'promptosaur',
    master: 'promptopotamus',
};

// NEW: Add the AI Template data
export const aiTemplates = [
  {
    id: 1,
    category: 'AI Business Templates',
    title: 'Results-Driven Resume',
    prompt: "Generate a results-driven, ATS-optimized resume for a [INSERT JOB TITLE] with 5+ years of experience in [INSERT INDUSTRY OR SPECIALTY], highlighting achievements in campaign ROI, cross-platform strategy, and team leadership. Include a compelling summary statement and bullet points emphasizing quantifiable outcomes."
  },
  {
    id: 2,
    category: 'AI Business Templates',
    title: 'Cold Email Outreach',
    prompt: "Write a persuasive cold email introducing a digital brand consultancy service to [INSERT TARGET CLIENT TYPE]. Focus on solving pain points like poor conversion rates and brand consistency. Keep the tone confident, helpful, and include a call to action for a 15-minute free consult."
  },
  {
    id: 3,
    category: 'AI Business Templates',
    title: 'One-Page Business Plan',
    prompt: "Develop a concise one-page business plan for a subscription-based [INSERT PRODUCT OR SERVICE TYPE] targeting [INSERT TARGET USER]. Include key elements: value proposition, market problem, solution, customer segments, pricing strategy, and primary marketing channels."
  },
  {
    id: 4,
    category: 'Notion Productivity Systems',
    title: 'Multi-Level Goal Tracker',
    prompt: "Design a Notion template for goal-setting and tracking that includes daily action items, weekly reflections, monthly milestones, and annual review columns. Use color-coded tags for priority levels and progress bars to visually track completion percentage."
  },
  {
    id: 5,
    category: 'Notion Productivity Systems',
    title: 'Freelancer CRM System',
    prompt: "Create a Notion workspace for freelance graphic designers to manage leads, active clients, project stages, deadlines, payment status, and communication logs in a centralized dashboard with Kanban and table views."
  },
  {
    id: 6,
    category: 'Notion Productivity Systems',
    title: 'Social Media Content Planner',
    prompt: "Construct a Notion layout for social media managers to organize post ideas by platform (Instagram, LinkedIn, TikTok), schedule publish dates, attach media files, and monitor engagement metrics post-launch."
  },
  {
    id: 7,
    category: 'ChatGPT Prompt Packs',
    title: 'Product Description Writer',
    prompt: "Craft an engaging product description for a [INSERT PRODUCT DESCRIPTION] designed for [INSERT TARGET AUDIENCE]. Emphasize design, function, and psychological benefits such as mental clarity and increased execution speed."
  },
  {
    id: 8,
    category: 'ChatGPT Prompt Packs',
    title: 'Blog Strategy Generator',
    prompt: "Generate an SEO-optimized blog post outline for the topic: '5 Ways Solopreneurs Can Leverage AI Tools to 10x Their Output.' Structure should include intro, 5 actionable subheads, and a strong CTA for downloading a free AI toolkit."
  },
  {
    id: 9,
    category: 'ChatGPT Prompt Packs',
    title: 'AI Business Idea Generator',
    prompt: "List 10 innovative product ideas that integrate ChatGPT or other LLMs into productivity tools specifically for remote team leaders, focusing on workflow automation, meeting summaries, and personalized onboarding assistants."
  },
  {
    id: 10,
    category: 'Digital Planners',
    title: 'Executive Daily Planner',
    prompt: "Design a printable executive daily planner layout that includes 15-minute time blocking from 6 AM-10 PM, a 'Top 3 Priorities' section, notes, water intake tracker, and a space for daily wins and gratitude."
  },
  {
    id: 11,
    category: 'Digital Planners',
    title: 'Monthly Budget Tracker',
    prompt: "Create a modern, spreadsheet-style financial planner that includes fields for income sources, categorized expenses (housing, utilities, food, transportation), debt repayments, and goal-based savings allocations."
  },
  {
    id: 12,
    category: 'Digital Planners',
    title: 'Mental Wellness Tracker',
    prompt: "Develop a comprehensive digital planner for mental health that tracks mood (using emojis), energy levels, stress triggers, daily journaling prompts, self-care actions, and progress notes over a 30-day cycle."
  }
];
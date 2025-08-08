// src/data/tools.ts
export type ToolCategory =
  | "Chatbot"
  | "Image Generation"
  | "Search"
  | "Writing"
  | "Coding"
  | "Productivity";

export interface AITool {
  slug: string;
  name: string;
  description: string;
  keySpecifications: string[];
  pricing: string;
  hotOffers?: string[];
  type: ToolCategory;
  url: string;
  trendingScore: number; // Higher = more trending
}

export const aiTools: AITool[] = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description: "Conversational AI by OpenAI for chat, reasoning, and creation.",
    keySpecifications: [
      "Advanced reasoning with multimodal support",
      "Custom GPTs and shared assistants",
      "Strong ecosystem integrations and plugins",
    ],
    pricing: "Free tier available; Plus/Team/Enterprise plans",
    hotOffers: ["Student discounts via eligible programs"],
    type: "Chatbot",
    url: "https://chat.openai.com",
    trendingScore: 98,
  },
  {
    slug: "claude",
    name: "Claude",
    description: "Helpful, harmless, and honest AI assistant by Anthropic.",
    keySpecifications: [
      "Great writing quality and long context",
      "Strong safety and constitutional AI",
      "Enterprise collaboration features",
    ],
    pricing: "Free tier; Pro and Team plans",
    hotOffers: ["Discounted academic access in some regions"],
    type: "Chatbot",
    url: "https://claude.ai",
    trendingScore: 92,
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    description: "Answer engine with cited sources and focused research modes.",
    keySpecifications: [
      "Citations-first answers",
      "Collections and copilots for research",
      "Web and academic modes",
    ],
    pricing: "Free; Pro with higher limits and models",
    type: "Search",
    url: "https://www.perplexity.ai",
    trendingScore: 88,
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    description: "High-quality AI image generation with artistic control.",
    keySpecifications: [
      "Photorealistic and stylized outputs",
      "Aspect ratio and prompt control",
      "Community-driven workflows",
    ],
    pricing: "Paid plans; community trials vary",
    type: "Image Generation",
    url: "https://www.midjourney.com",
    trendingScore: 90,
  },
  {
    slug: "dalle",
    name: "DALL·E",
    description: "OpenAI image generation with inpainting and variations.",
    keySpecifications: [
      "In/outpainting, variations, and editing",
      "Good prompt adherence",
      "Fast iterations",
    ],
    pricing: "Pay per image; included in some OpenAI plans",
    type: "Image Generation",
    url: "https://labs.openai.com",
    trendingScore: 84,
  },
];

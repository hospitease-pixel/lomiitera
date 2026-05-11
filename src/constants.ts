import { BusinessCard } from "./types";

export const ADMIN_EMAIL = 'sofoniasgenanaw12@gmail.com';

export const DEFAULT_COLORS = {
  cardBg: "#ffffff",
  coverBg: "#000000",
  name: "#111827",
  org: "#fbbf24", // Lemon yellow accent
  title: "#1f2937",
  bio: "#6b7280",
  separator: "#9ca3af",
  wave: "#fbbf24",
  mainBtn: "#000000", // Premium Black
  contactBtn: "#000000",
  utilBtn: "#f3f4f6",
  mainBtnText: "#ffffff",
  contactBtnText: "#ffffff",
  utilBtnText: "#1f2937",
  qrBtnText: "#1f2937",
  orderBtnText: "#1f2937"
};

export const COLOR_PRESETS = [
  {
    name: 'Premium Dark',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#0a0a0a",
      coverBg: "#111111",
      name: "#ffffff",
      title: "#9ca3af",
      bio: "#6b7280",
      mainBtn: "#fbbf24",
      mainBtnText: "#000000",
      utilBtn: "#1f2937",
      utilBtnText: "#ffffff",
      qrBtnText: "#9ca3af",
      orderBtnText: "#fbbf24"
    }
  },
  {
    name: 'Classic Light',
    colors: DEFAULT_COLORS
  },
  {
    name: 'Midnight Blue',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#ffffff",
      coverBg: "#1e3a8a",
      name: "#1e3a8a",
      org: "#3b82f6",
      mainBtn: "#1e3a8a",
      mainBtnText: "#ffffff",
    }
  },
  {
    name: 'Forest Gold',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#ffffff",
      coverBg: "#064e3b",
      name: "#064e3b",
      org: "#fbbf24",
      mainBtn: "#064e3b",
      mainBtnText: "#ffffff",
    }
  },
  {
    name: 'Royal Purple',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#ffffff",
      coverBg: "#581c87",
      name: "#581c87",
      org: "#a855f7",
      mainBtn: "#581c87",
      mainBtnText: "#ffffff",
    }
  }
];

export const CARD_TEMPLATES = [
  {
    id: 'standard',
    name: 'Executive Standard',
    layout: 'standard',
    colors: DEFAULT_COLORS,
    description: 'Clean, professional layout with a focus on profile visibility.'
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    layout: 'minimal',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#f9fafb",
      coverBg: "#ffffff",
      name: "#000000",
      org: "#6366f1",
      mainBtn: "#000000",
      utilBtn: "#ffffff"
    },
    description: 'Ultra-clean design with subtle accents and plenty of white space.'
  },
  {
    id: 'dark-glass',
    name: 'Futuristic Glass',
    layout: 'glass',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#030712",
      coverBg: "#111827",
      name: "#ffffff",
      org: "#10b981",
      title: "#9ca3af",
      bio: "#6b7280",
      mainBtn: "#ffffff",
      mainBtnText: "#000000",
      utilBtn: "#1f2937",
      utilBtnText: "#ffffff",
      qrBtnText: "#10b981",
      orderBtnText: "#10b981"
    },
    description: 'High-contrast dark mode with elegant translucent elements.'
  },
  {
    id: 'pro-brand',
    name: 'Bold Brand',
    layout: 'modern',
    colors: {
      ...DEFAULT_COLORS,
      cardBg: "#ffffff",
      coverBg: "#eab308",
      name: "#111827",
      org: "#000000",
      mainBtn: "#eab308",
      mainBtnText: "#000000",
      utilBtn: "#fef9c3"
    },
    description: 'Dynamic layout that uses bold brand colors to make an impact.'
  }
];

export const INITIAL_CARD_DATA: Omit<BusinessCard, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: "New Profile",
  organization: "TapNix",
  title: "Professional",
  bio: "Welcome to my digital business card.",
  image: "https://i.ibb.co/VYgNpFPY/f97ad8c3-a99e-449e-8c0e-f4fcd3d6b112.png",
  logo: "https://i.ibb.co/SwR502xf/Untitled-design-10.png",
  logoType: 'image',
  logoColor: '#eab308',
  phones: [],
  emails: [],
  website: "",
  location: "",
  paymentUrl: "",
  qrLink: "",
  socialLinks: [],
  customLinks: [],
  portfolios: [],
  colors: DEFAULT_COLORS,
  layout: 'standard',
  stats: {
    views: 0,
    clicks: {}
  },
  verified: false
};

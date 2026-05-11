export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'telegram' | 'whatsapp' | 'tiktok' | 'linkedin' | 'link' | 'twitter' | 'github';
  url: string;
}

export interface CustomLink {
  tag: string;
  url: string;
}

export interface CardColors {
  cardBg: string;
  coverBg: string;
  name: string;
  org: string;
  title: string;
  bio: string;
  separator: string;
  wave: string;
  mainBtn: string;
  contactBtn: string;
  utilBtn: string;
  mainBtnText: string;
  contactBtnText: string;
  utilBtnText: string;
  qrBtnText: string;
  orderBtnText: string;
}

export interface ContactInfo {
  tag: string;
  value: string;
}

export interface BusinessCard {
  id: string;
  userId: string;
  name: string;
  organization: string;
  title: string;
  bio: string;
  image: string; // URL
  logo: string; // URL
  logoType?: 'image' | 'color';
  logoColor?: string;
  phones: ContactInfo[];
  emails: ContactInfo[];
  website: string;
  location: string;
  paymentUrl?: string;
  qrLink: string;
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
  portfolios: string[];
  colors: CardColors;
  layout?: 'standard' | 'minimal' | 'modern' | 'glass';
  stats: {
    views: number;
    clicks?: Record<string, number>;
  };
  verified?: boolean;
  ownerEmailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AnalyticsEvent {
  id: string;
  cardId: string;
  ownerId: string;
  type: 'view' | 'click' | 'share' | 'link_click' | 'save';
  target?: string;
  timestamp: number;
}

export interface User {
  email: string;
  password_hash: string;
  preferences: Preferences;
  subscribed: boolean;
  created_at: string;
}

export interface Preferences {
  products: ('OIC' | 'FUSION')[];
  fusionModules: ('Financials' | 'HCM' | 'Supply Chain' | 'Customer Experience' | 'Common Technologies')[];
  frequency: 'instant';
}

export interface Update {
  id: number;
  title: string;
  description: string;
  full_synopsis: string;
  release_date: string;
  product: 'OIC' | 'FUSION';
  module: 'Financials' | 'HCM' | 'Supply Chain' | 'Customer Experience' | 'Common Technologies' | null;
  patch_version: string;
  official_news_url: string;
  docs_url: string;
  hash: string;
  created_at: string;
}

export interface SessionUser {
  email: string;
}

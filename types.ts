export interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  location: string;
  address?: string;
  fullAddress?: string;
  village?: string;
  postOffice?: string;
  policeStation?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  education: string;
  email: string; // Default / primary contact
  consultancyEmail?: string; // contact@solmanchoudhury.in
  exportEmail?: string; // admin@chaikosh.in
  exportSecondaryEmail?: string; // chaikoshagrielectroindustries@gmail.com
  personalPhone: string;
  businessPhone: string;
  facebook: string;
  facebookName: string;
  linkedin?: string;
  twitterPersonal?: string;
  twitterBusiness?: string;
  instagram: string;
  instagramHandle: string;
  instagramBrand?: string;
  company: string;
  companyRole: string;
  bio: string;
  avatarUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  organization: string;
  role: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  icon: 'Ship' | 'FileCheck' | 'Code' | 'ShieldCheck' | 'Briefcase' | 'TrendingUp';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Northeast Expeditions' | 'Global Trade & Agrielectro' | 'Nature & Travels' | 'Consultancy & Engagements' | 'General';
  mediaType: 'image' | 'video';
  url: string;
  caption: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  coverImage: string;
  excerpt: string;
  readTime: string;
  publishedDate: string;
  isPublished: boolean;
  content: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  date: string;
  status: 'new' | 'replied' | 'archived';
}

export interface AppData {
  profile: ProfileData;
  services: ServiceItem[];
  gallery: GalleryItem[];
  articles: Article[];
  inquiries: Inquiry[];
}

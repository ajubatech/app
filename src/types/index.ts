export interface User {
  id: string;
  email: string;
  role: 'guest' | 'user' | 'business' | 'admin' | 'super_admin' | 'content_admin' | 'support_admin';
  created_at: string;
  profile?: UserProfile;
  subscription?: Subscription;
  aiService?: AIService;
  user_types?: ('buyer' | 'lister' | 'business')[];
  full_name?: string;
  avatar_url?: string;
  ai_credits: number;
  listing_credits: number;
  username?: string;
  verified?: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string;
  banner_url: string;
  description: string;
  category: string[];
  rating: number;
  review_count: number;
  contact_info: {
    email: string;
    phone: string;
    website?: string;
    address: string;
  };
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  services: Service[];
  products: Product[];
}

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  tag?: MediaTag;
  status?: ListingStatus;
}

export type MediaTag = 'Property Info Pack' | 'Mandatory Doc by Govt' | 'Main Photo' | 'Gallery';
export type ListingStatus = 'New' | 'Sold' | 'Rented' | 'Hidden' | string;

export interface VideoEmbed {
  url: string;
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram';
  controls: {
    autoplay: boolean;
    loop: boolean;
    mute: boolean;
    isMain: boolean;
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  user_id: string;
  business_id?: string;
  created_at: string;
  updated_at: string;
  status: ListingStatus;
  images: MediaFile[];
  videos: VideoEmbed[];
  views: number;
  likes: number;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata: RealEstate | Product | Service | Automotive;
}

export type ListingCategory = 'real_estate' | 'products' | 'services' | 'automotive' | 'pets';

export interface RealEstate {
  property_type: 'house' | 'apartment' | 'townhouse' | 'land';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  land_size: number;
  floor_area: number;
  year_built?: number;
  open_homes: OpenHome[];
  features: string[];
  amenities: string[];
}

export interface OpenHome {
  date: string;
  start_time: string;
  end_time: string;
  agent: string;
}

export interface Product {
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  model?: string;
  variants: ProductVariant[];
  specifications: Record<string, string>;
  shipping_info: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    free_shipping: boolean;
    estimated_days: number;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Service {
  category: string;
  subcategory: string;
  delivery_time: number;
  revisions: number;
  packages: ServicePackage[];
  portfolio: PortfolioItem[];
  skills: string[];
  languages: string[];
  certification?: string[];
}

export interface ServicePackage {
  name: string;
  price: number;
  description: string;
  features: string[];
  delivery_time: number;
  revisions: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Automotive {
  make: string;
  model: string;
  year: number;
  variant: string;
  body_type: string;
  transmission: 'automatic' | 'manual';
  fuel_type: string;
  engine: {
    size: number;
    cylinders: number;
    power: number;
    torque: number;
  };
  odometer: number;
  registration: {
    plate: string;
    expiry: string;
    state: string;
  };
  features: string[];
  history: {
    owners: number;
    accidents: boolean;
    service_history: boolean;
  };
}

export interface Review {
  id: string;
  user_id: string;
  listing_id: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  images?: string[];
  user: {
    name: string;
    avatar_url: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  created_at: string;
  read: boolean;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'offer' | 'review' | 'system';
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

export interface AIService {
  remainingCredits: number;
  usageLimit: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  type: 'free' | 'basic' | 'pro' | 'business';
  price: number;
  aiCredits: number;
  features: {
    aiListings: boolean;
    visionAI: boolean;
    propertyLookup: boolean;
    carLookup: boolean;
    crm: boolean;
    teamMembers: boolean;
    businessProfile: boolean;
  };
  teamMembers?: number;
}

export interface RentalApplication {
  id: string;
  user_id: string;
  listing_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  documents: {
    type: string;
    url: string;
    name: string;
  }[];
  references: {
    name: string;
    relationship: string;
    contact: string;
  }[];
  employment: {
    employer: string;
    position: string;
    income: number;
    duration: string;
  };
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  images?: string[];
  assigned_to?: string;
}

export interface Inspection {
  id: string;
  property_id: string;
  scheduled_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  inspector_id: string;
  tenant_present: boolean;
  items: {
    area: string;
    condition: 'good' | 'fair' | 'poor';
    notes: string;
    images?: string[];
  }[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  business_id: string;
  role: 'admin' | 'manager' | 'agent' | 'assistant';
  permissions: string[];
  joined_at: string;
  status: 'active' | 'inactive';
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  saved_at: string;
  notes?: string;
}

export interface Inquiry {
  id: string;
  user_id: string;
  listing_id: string;
  message: string;
  created_at: string;
  status: 'new' | 'replied' | 'closed';
  replies?: {
    sender_id: string;
    message: string;
    created_at: string;
  }[];
}

export interface Reel {
  id: string;
  user_id: string;
  listing_id?: string;
  media_id?: string;
  title?: string;
  caption: string;
  hashtags: string[];
  music?: {
    title: string;
    artist: string;
    url: string;
    start_time?: number;
    duration?: number;
  };
  effects: {
    filters?: string[];
    stickers?: {
      id: string;
      type: string;
      position: { x: number; y: number };
      scale: number;
      rotation: number;
    }[];
    text_overlays?: {
      id: string;
      text: string;
      position: { x: number; y: number };
      style: {
        font: string;
        size: number;
        color: string;
        background?: string;
      };
    }[];
  };
  status: 'draft' | 'published' | 'archived';
  views: number;
  created_at: string;
  published_at?: string;
}

export interface ReelEngagement {
  id: string;
  reel_id: string;
  user_id: string;
  type: 'like' | 'comment' | 'share' | 'save';
  comment_text?: string;
  created_at: string;
}

export interface SocialShare {
  id: string;
  reel_id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin';
  status: 'pending' | 'shared' | 'failed';
  share_url?: string;
  created_at: string;
}

export interface ListerProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  position: string;
  experience_years: number;
  specializations: string[];
  languages: string[];
  certifications: string[];
  contact_info: {
    email: string;
    phone: string;
    office_address?: string;
  };
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  agency_id?: string;
  verified: boolean;
  featured: boolean;
  stats: {
    listings_count: number;
    sold_count: number;
    rented_count: number;
    rating: number;
    reviews_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AgencyProfile {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  banner_url: string;
  description: string;
  established_year: number;
  locations: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    lat?: number;
    lng?: number;
    is_headquarters: boolean;
    phone: string;
  }[];
  contact_info: {
    email: string;
    phone: string;
    website?: string;
  };
  social_links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  team_members: string[]; // Array of user_ids
  specializations: string[];
  awards: {
    title: string;
    year: number;
    description?: string;
  }[];
  stats: {
    listings_count: number;
    sold_count: number;
    rented_count: number;
    rating: number;
    reviews_count: number;
  };
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  recipient_email: string;
  recipient_name?: string;
  recipient_address?: string;
  listing_id?: string;
  type: 'sale' | 'rent' | 'service' | 'product';
  title: string;
  description?: string;
  amount: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  pdf_url?: string;
  invoice_number: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
  tax_amount?: number;
  created_at: string;
}

export interface InvoiceSettings {
  user_id: string;
  business_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_number?: string;
  bank_details?: {
    account_name?: string;
    account_number?: string;
    bank_name?: string;
    branch_code?: string;
    swift_code?: string;
  };
  terms?: string;
  notes?: string;
  invoice_prefix: string;
  next_invoice_number: number;
  created_at: string;
  updated_at: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  thumbnail?: string;
  category: string;
  isPremium: boolean;
}

export interface Sticker {
  id: string;
  name: string;
  url: string;
  category: string;
  isPremium: boolean;
}

export interface TextStyle {
  id: string;
  name: string;
  font: string;
  color: string;
  background?: string;
  isPremium: boolean;
}

export interface Filter {
  id: string;
  name: string;
  preview: string;
  strength: number;
  isPremium: boolean;
}
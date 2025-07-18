export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'trial' | 'monthly' | 'yearly';
  trialStartDate?: Date;
  trialEndsDate?: Date;
  capsulesSent: number;
  socialSharesCompleted: number;
}

export interface Capsule {
  id: string;
  userId: string;
  title: string;
  message: string;
  recipients: Recipient[];
  deliveryDate: Date;
  files: CapsuleFile[];
  customization: CapsuleCustomization;
  status: 'draft' | 'sealed' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface CapsuleFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
}

export interface CapsuleCustomization {
  layout: 'classic' | 'modern' | 'elegant';
  backgroundColor: string;
  backgroundImage?: string;
  fontFamily: string;
  accentColor: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  service: 'timecapsule' | 'customsong';
  verified: boolean;
  createdAt: Date;
}

export interface WaitingListEntry {
  id: string;
  name: string;
  email: string;
  service: 'customsong';
  createdAt: Date;
}
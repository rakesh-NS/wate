export enum WasteCategory {
  PLASTIC = 'PLASTIC',
  ORGANIC = 'ORGANIC',
  METAL = 'METAL',
  PAPER = 'PAPER',
  GLASS = 'GLASS',
  EWASTE = 'EWASTE',
  GENERAL = 'GENERAL',
}

export interface ClassificationResponse {
  category: WasteCategory;
  reasoning: string;
  isAnimated?: boolean;
  animationExplanation?: string;
}

export interface PickupDetails {
  team: string; 
  date: string;
  timeSlot: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PICKUP_TEAM = 'PICKUP_TEAM',
}

export enum PickupRequestStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED_BY_TEAM = 'COMPLETED_BY_TEAM',
  CONFIRMED_BY_USER = 'CONFIRMED_BY_USER'
}

export interface User {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  operatesIn?: string[]; 
  // User Profile
  address?: string;
  contact?: string;
  // Team Profile
  availability?: 'AVAILABLE' | 'UNAVAILABLE';
  vehicleInfo?: string;
}

export interface Location {
  city: string;
  place: string;
}

export interface Feedback {
  rating: number;
  comment: string;
}

export interface PickupRequest extends ClassificationResponse {
  id: string;
  user: User;
  location: Location;
  imagePreview: string;
  status: PickupRequestStatus;
  assignedTeam: User;
  feedback?: Feedback;
  // User selected schedule
  pickupDate: string;
  pickupTimeSlot: string;
  // Team provided data
  collectionProofImage?: string;
}

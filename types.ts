export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  videoUrl?: string;
  galleryImages?: string[];
  description?: string;
  client?: string;
  tools?: string;
}

export interface Profile {
  name: string;
  title: string;
  heroDescription: string;
  bio: string;
  creativeApproach: string;
  email: string;
  phone: string;
  location: string;
  profileImageUrl: string;
  heroImageUrl: string;
  instagram: string;
  linkedin: string;
}

export interface AppData {
  projects: Project[];
  profile: Profile;
}
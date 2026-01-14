
export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  description?: string;
  client?: string;
  camera?: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
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

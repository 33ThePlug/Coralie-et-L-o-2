// Photo types
export interface Photo {
  id: number;
  filename: string;
  caption?: string | null;
  date: string | Date;
}

// Note types
export interface Note {
  id: number;
  title: string;
  content: string;
  date: string | Date;
}

// User types
export interface User {
  id: number;
  username: string;
  password: string;
}

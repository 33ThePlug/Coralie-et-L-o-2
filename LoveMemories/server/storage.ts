import { 
  users, notes, photos, 
  type User, type InsertUser, 
  type Note, type InsertNote, 
  type Photo, type InsertPhoto 
} from "@shared/schema";
import path from "path";
import fs from "fs";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Photo methods
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<void>;
  searchPhotos(query: string): Promise<Photo[]>;
  
  // Note methods
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<void>;
  searchNotes(query: string): Promise<Note[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  private photos: Map<number, Photo>;
  private userCurrentId: number;
  private noteCurrentId: number;
  private photoCurrentId: number;
  private uploadsDir: string;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.photos = new Map();
    this.userCurrentId = 1;
    this.noteCurrentId = 1;
    this.photoCurrentId = 1;
    this.uploadsDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    // Add default user (Coralie & Léo)
    this.createUser({
      username: "coralieleo",
      password: "4079" // This would typically be hashed in a real app
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoCurrentId++;
    const photo: Photo = { 
      ...insertPhoto, 
      id, 
      date: new Date() 
    };
    this.photos.set(id, photo);
    return photo;
  }

  async deletePhoto(id: number): Promise<void> {
    const photo = this.photos.get(id);
    if (photo) {
      // Delete file if it exists
      const filePath = path.join(this.uploadsDir, photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      this.photos.delete(id);
    }
  }

  async searchPhotos(query: string): Promise<Photo[]> {
    if (!query) return this.getPhotos();
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.photos.values())
      .filter(photo => 
        photo.caption?.toLowerCase().includes(lowerQuery) ||
        photo.filename.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const note: Note = { 
      ...insertNote, 
      id, 
      date: new Date() 
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) return undefined;

    const updatedNote: Note = {
      ...existingNote,
      ...noteUpdate,
      date: new Date() // Update the date when note is modified
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    if (!query) return this.getNotes();
    
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values())
      .filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

// Import and use the DatabaseStorage
import { DatabaseStorage } from "./database-storage";

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();

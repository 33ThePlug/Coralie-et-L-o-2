import { 
  users, notes, photos, 
  type User, type InsertUser, 
  type Note, type InsertNote, 
  type Photo, type InsertPhoto 
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc } from "drizzle-orm";
import { IStorage } from "./storage";
import path from "path";
import fs from "fs";

export class DatabaseStorage implements IStorage {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return db.select().from(photos).orderBy(desc(photos.date));
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const result = await db.select().from(photos).where(eq(photos.id, id));
    return result[0];
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const result = await db
      .insert(photos)
      .values({ ...insertPhoto, date: new Date() })
      .returning();
    return result[0];
  }

  async deletePhoto(id: number): Promise<void> {
    const photo = await this.getPhoto(id);
    if (photo) {
      // Delete file if it exists
      const filePath = path.join(this.uploadsDir, photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await db.delete(photos).where(eq(photos.id, id));
    }
  }

  async searchPhotos(query: string): Promise<Photo[]> {
    if (!query) return this.getPhotos();
    
    return db
      .select()
      .from(photos)
      .where(
        like(photos.caption || '', `%${query}%`)
      )
      .orderBy(desc(photos.date));
  }

  // Note methods
  async getNotes(): Promise<Note[]> {
    return db.select().from(notes).orderBy(desc(notes.date));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result[0];
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const result = await db
      .insert(notes)
      .values({ ...insertNote, date: new Date() })
      .returning();
    return result[0];
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = await this.getNote(id);
    if (!existingNote) return undefined;

    const result = await db
      .update(notes)
      .set({ ...noteUpdate, date: new Date() })
      .where(eq(notes.id, id))
      .returning();
    
    return result[0];
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async searchNotes(query: string): Promise<Note[]> {
    if (!query) return this.getNotes();
    
    const lowerQuery = query.toLowerCase();
    return db
      .select()
      .from(notes)
      .where(
        like(notes.title, `%${query}%`)
      )
      .orderBy(desc(notes.date));
  }
}
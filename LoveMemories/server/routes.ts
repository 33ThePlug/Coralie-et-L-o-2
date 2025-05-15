import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertNoteSchema, insertPhotoSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|heic/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

// PIN validation middleware
const validatePin = (req: Request, res: Response, next: Function) => {
  const pin = req.headers.authorization;
  if (pin !== '4079') {
    return res.status(401).json({ message: 'Unauthorized: Invalid PIN' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files - make it accessible without validation for images to display
  app.use('/api/uploads', express.static(uploadsDir));
  
  // API routes
  
  // Auth route - verify PIN
  app.post('/api/auth/verify', (req, res) => {
    const { pin } = req.body;
    
    if (pin === '4079') {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
  });
  
  // Photo routes
  app.get('/api/photos', validatePin, async (req, res) => {
    try {
      const query = req.query.search as string | undefined;
      const photos = query 
        ? await storage.searchPhotos(query)
        : await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch photos' });
    }
  });
  
  app.get('/api/photos/:id', validatePin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      
      if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch photo' });
    }
  });
  
  app.post('/api/photos', validatePin, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const validationResult = insertPhotoSchema.safeParse({
        filename: req.file.filename,
        caption: req.body.caption || null
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid photo data', errors: validationResult.error });
      }
      
      const photo = await storage.createPhoto(validationResult.data);
      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload photo' });
    }
  });
  
  app.delete('/api/photos/:id', validatePin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhoto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete photo' });
    }
  });
  
  // Note routes
  app.get('/api/notes', validatePin, async (req, res) => {
    try {
      const query = req.query.search as string | undefined;
      const notes = query 
        ? await storage.searchNotes(query)
        : await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });
  
  app.get('/api/notes/:id', validatePin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch note' });
    }
  });
  
  app.post('/api/notes', validatePin, async (req, res) => {
    try {
      const validationResult = insertNoteSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid note data', errors: validationResult.error });
      }
      
      const note = await storage.createNote(validationResult.data);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create note' });
    }
  });
  
  app.put('/api/notes/:id', validatePin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body
      const validationSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional()
      });
      
      const validationResult = validationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid note data', errors: validationResult.error });
      }
      
      const updatedNote = await storage.updateNote(id, validationResult.data);
      
      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update note' });
    }
  });
  
  app.delete('/api/notes/:id', validatePin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNote(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete note' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";

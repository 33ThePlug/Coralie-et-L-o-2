import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types";
import NoteCard from "./NoteCard";
import EditNoteDialog from "./EditNoteDialog";
import { motion, AnimatePresence } from "framer-motion";
import { container, item } from "@/lib/animations";

interface NotesScreenProps {
  searchQuery: string;
  showAddNoteDialog: boolean;
  onCloseAddNoteDialog: () => void;
}

const NotesScreen = ({ searchQuery, showAddNoteDialog, onCloseAddNoteDialog }: NotesScreenProps) => {
  const { toast } = useToast();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Fetch notes with search query if provided
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['/api/notes', searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/notes?search=${encodeURIComponent(searchQuery)}` 
        : '/api/notes';
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    }
  });
  
  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest('DELETE', `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      toast({
        title: "Note supprimée",
        description: "La note a été supprimée avec succès.",
      });
      // Invalidate notes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
    },
    onError: (err) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note.",
        variant: "destructive",
      });
      console.error("Error deleting note:", err);
    }
  });
  
  // Handle note deletion
  const handleDeleteNote = (id: number) => {
    deleteNoteMutation.mutate(id);
  };
  
  // Handle note edit
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };
  
  const handleCloseEditDialog = () => {
    setEditingNote(null);
    onCloseAddNoteDialog();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="loader">Chargement...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Une erreur est survenue lors du chargement des notes.
      </div>
    );
  }
  
  const isEditMode = Boolean(editingNote);
  const showDialog = showAddNoteDialog || isEditMode;
  
  return (
    <>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {notes && notes.length > 0 ? (
            notes.map((note: Note) => (
              <motion.div key={note.id} variants={item} layout>
                <NoteCard 
                  note={note} 
                  onDelete={() => handleDeleteNote(note.id)}
                  onEdit={() => handleEditNote(note)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              {searchQuery 
                ? "Aucune note ne correspond à votre recherche." 
                : "Aucune note. Ajoutez votre première note !"}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {showDialog && (
        <EditNoteDialog 
          open={showDialog} 
          onClose={handleCloseEditDialog}
          note={editingNote}
        />
      )}
    </>
  );
};

export default NotesScreen;

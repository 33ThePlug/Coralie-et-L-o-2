import { Note } from "@/types";
import { PenSquare, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
  onEdit: () => void;
}

const NoteCard = ({ note, onDelete, onEdit }: NoteCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };
  
  return (
    <>
      <motion.div 
        className="note-card bg-card rounded-xl p-4 shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={onEdit}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg">{note.title}</h3>
          <span className="text-xs text-muted-foreground">{formatDate(note.date)}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {note.content}
        </p>
        <div className="flex justify-end mt-3 space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-primary hover:text-primary/70"
            aria-label="Edit note"
          >
            <PenSquare className="h-5 w-5" />
          </button>
          <button 
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive/70"
            aria-label="Delete note"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La note sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NoteCard;

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Note } from "@/types";

interface EditNoteDialogProps {
  open: boolean;
  onClose: () => void;
  note: Note | null; // null for new note, Note for editing
}

const EditNoteDialog = ({ open, onClose, note }: EditNoteDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const isEditing = !!note;

  // Initialize form values when editing an existing note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  // Create/Update note mutation
  const noteMutation = useMutation({
    mutationFn: async () => {
      const noteData = { title, content };
      
      if (isEditing && note) {
        // Update existing note
        return apiRequest('PUT', `/api/notes/${note.id}`, noteData);
      } else {
        // Create new note
        return apiRequest('POST', '/api/notes', noteData);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Note mise à jour" : "Note créée",
        description: isEditing 
          ? "Votre note a été mise à jour avec succès." 
          : "Votre note a été créée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de l'enregistrement de la note.",
        variant: "destructive",
      });
    }
  });

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }
    
    noteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier la note" : "Ajouter une note"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu de la note..."
                className="min-h-[150px] resize-none"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={noteMutation.isPending || !title.trim()}
            >
              {noteMutation.isPending 
                ? "Enregistrement..." 
                : isEditing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;

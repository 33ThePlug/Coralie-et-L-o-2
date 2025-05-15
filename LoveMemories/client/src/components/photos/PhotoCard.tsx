import { useState } from "react";
import { Photo } from "@/types";
import { Eye, Download, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";

interface PhotoCardProps {
  photo: Photo;
  onDelete: () => void;
}

const PhotoCard = ({ photo, onDelete }: PhotoCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleViewPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = `/api/uploads/${photo.filename}`;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        className="photo-card bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="aspect-w-4 aspect-h-3 relative group">
          <img 
            src={`/api/uploads/${photo.filename}`} 
            alt={photo.caption || "Photo"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
              <button 
                onClick={handleViewPhoto} 
                className="p-2 bg-card rounded-full mx-1"
                aria-label="View photo"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button 
                onClick={handleDownload} 
                className="p-2 bg-card rounded-full mx-1"
                aria-label="Download photo"
              >
                <Download className="h-5 w-5" />
              </button>
              <button 
                onClick={handleDeleteClick} 
                className="p-2 bg-card rounded-full mx-1 text-destructive"
                aria-label="Delete photo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm text-muted-foreground">{formatDate(photo.date)}</p>
          {photo.caption && (
            <p className="text-sm mt-1 truncate">{photo.caption}</p>
          )}
        </div>
      </motion.div>

      {/* Photo Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <div className="overflow-hidden rounded-md">
            <img 
              src={`/api/uploads/${photo.filename}`} 
              alt={photo.caption || "Photo"} 
              className="w-full h-auto object-contain max-h-[70vh]"
            />
          </div>
          {photo.caption && (
            <p className="text-center mt-2">{photo.caption}</p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {formatDate(photo.date)}
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La photo sera définitivement supprimée.
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

export default PhotoCard;

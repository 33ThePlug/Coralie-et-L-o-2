import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Photo } from "@/types";
import PhotoCard from "./PhotoCard";
import UploadPhotoDialog from "./UploadPhotoDialog";
import { motion, AnimatePresence } from "framer-motion";
import { container, item } from "@/lib/animations";

interface PhotosScreenProps {
  searchQuery: string;
  showUploadDialog: boolean;
  onCloseUploadDialog: () => void;
}

const PhotosScreen = ({ searchQuery, showUploadDialog, onCloseUploadDialog }: PhotosScreenProps) => {
  const { toast } = useToast();
  
  // Fetch photos with search query if provided
  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['/api/photos', searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/photos?search=${encodeURIComponent(searchQuery)}` 
        : '/api/photos';
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    }
  });
  
  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return apiRequest('DELETE', `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès.",
      });
      // Invalidate photos query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
    },
    onError: (err) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo.",
        variant: "destructive",
      });
      console.error("Error deleting photo:", err);
    }
  });
  
  // Handle photo deletion
  const handleDeletePhoto = (id: number) => {
    deletePhotoMutation.mutate(id);
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
        Une erreur est survenue lors du chargement des photos.
      </div>
    );
  }
  
  return (
    <>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {photos && photos.length > 0 ? (
            photos.map((photo: Photo) => (
              <motion.div key={photo.id} variants={item} layout>
                <PhotoCard 
                  photo={photo} 
                  onDelete={() => handleDeletePhoto(photo.id)} 
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              {searchQuery 
                ? "Aucune photo ne correspond à votre recherche." 
                : "Aucune photo. Ajoutez votre première photo !"}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {showUploadDialog && (
        <UploadPhotoDialog 
          open={showUploadDialog} 
          onClose={onCloseUploadDialog} 
        />
      )}
    </>
  );
};

export default PhotosScreen;

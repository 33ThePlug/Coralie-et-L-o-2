import { useState, useRef, useEffect } from "react";
import { Image, PenSquare, Plus, X } from "lucide-react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";
import { TabType } from "@/components/layout/TabBar";

interface FloatingActionButtonProps {
  activeTab: TabType;
  onAddPhoto: () => void;
  onAddNote: () => void;
}

const FloatingActionButton = ({ activeTab, onAddPhoto, onAddNote }: FloatingActionButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleAddPhoto = () => {
    onAddPhoto();
    setShowMenu(false);
  };

  const handleAddNote = () => {
    onAddNote();
    setShowMenu(false);
  };

  return (
    <div ref={fabRef} className="fixed right-6 bottom-6 z-40">
      <Button
        onClick={toggleMenu}
        size="icon"
        className="circle-btn w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        {showMenu ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
      
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 bg-card rounded-lg shadow-xl p-2 w-48 slide-up"
          >
            <button
              onClick={handleAddPhoto}
              className={`w-full flex items-center p-3 hover:bg-muted rounded-lg text-left ${
                activeTab === "notes" ? "opacity-50 pointer-events-none" : ""
              }`}
              disabled={activeTab === "notes"}
            >
              <Image className="h-5 w-5 mr-3" />
              Ajouter une photo
            </button>
            <button
              onClick={handleAddNote}
              className={`w-full flex items-center p-3 hover:bg-muted rounded-lg text-left ${
                activeTab === "photos" ? "opacity-50 pointer-events-none" : ""
              }`}
              disabled={activeTab === "photos"}
            >
              <PenSquare className="h-5 w-5 mr-3" />
              Ajouter une note
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;

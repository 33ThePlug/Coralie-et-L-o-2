import { useState } from "react";
import Header from "@/components/layout/Header";
import TabBar, { TabType } from "@/components/layout/TabBar";
import PhotosScreen from "@/components/photos/PhotosScreen";
import NotesScreen from "@/components/notes/NotesScreen";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { AnimatePresence, motion } from "framer-motion";

const Home = () => {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddPhoto = () => {
    setShowUploadDialog(true);
  };

  const handleAddNote = () => {
    setShowAddNoteDialog(true);
  };

  return (
    <div id="main-app" className="app-container">
      <Header onSearch={handleSearch} />
      <TabBar activeTab={activeTab} onChange={handleTabChange} />
      
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "photos" ? (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <PhotosScreen 
                searchQuery={searchQuery} 
                showUploadDialog={showUploadDialog}
                onCloseUploadDialog={() => setShowUploadDialog(false)} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <NotesScreen 
                searchQuery={searchQuery} 
                showAddNoteDialog={showAddNoteDialog}
                onCloseAddNoteDialog={() => setShowAddNoteDialog(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <FloatingActionButton 
        activeTab={activeTab}
        onAddPhoto={handleAddPhoto}
        onAddNote={handleAddNote}
      />
    </div>
  );
};

export default Home;

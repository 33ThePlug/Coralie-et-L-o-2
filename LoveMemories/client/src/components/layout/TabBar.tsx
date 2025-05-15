import { useState } from "react";
import { Image, PenSquare } from "lucide-react";

export type TabType = "photos" | "notes";

interface TabBarProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const TabBar = ({ activeTab, onChange }: TabBarProps) => {
  return (
    <nav className="border-t border-border">
      <div className="container mx-auto">
        <div className="flex">
          <button 
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === "photos" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => onChange("photos")}
          >
            <Image className="h-5 w-5 mx-auto mb-1" />
            Photos
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === "notes" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => onChange("notes")}
          >
            <PenSquare className="h-5 w-5 mx-auto mb-1" />
            Notes
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TabBar;

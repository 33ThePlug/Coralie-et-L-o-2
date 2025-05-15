import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Search, User } from "lucide-react";
import SearchBar from "@/components/ui/search-bar";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <header className="sticky top-0 z-40 bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary">Coralie & Léo</h1>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button 
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button className="w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center">
              <span className="font-medium text-sm">CL</span>
            </button>
          </div>
        </div>
      </div>
      
      {showSearch && (
        <SearchBar onSearch={onSearch} />
      )}
    </header>
  );
};

export default Header;

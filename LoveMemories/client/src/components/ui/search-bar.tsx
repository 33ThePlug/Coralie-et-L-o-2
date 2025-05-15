import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus on the search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  return (
    <motion.div 
      className="py-3 px-4 bg-muted border-t border-border slide-up"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="container mx-auto">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            className="w-full pl-10 pr-4"
            placeholder="Rechercher photos ou notes..."
            value={query}
            onChange={handleChange}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", query);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search instructions, packages, announcements, or FAQs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary"
        />
        <Button 
          type="submit" 
          size="icon" 
          className="absolute right-1 h-10 w-10"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
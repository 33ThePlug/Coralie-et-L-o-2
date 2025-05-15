import { useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PinScreenProps {
  children: ReactNode;
}

const PinScreen = ({ children }: PinScreenProps) => {
  const { isAuthenticated, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pin, setPin] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const { toast } = useToast();
  const pinDigits = 4;

  const handleNumberClick = (value: string) => {
    if (pin.length < pinDigits) {
      setPin((prev) => prev + value);
      setShowError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setShowError(false);
  };

  // When the PIN reaches the required length, attempt login
  useEffect(() => {
    if (pin.length === pinDigits) {
      // Attempt login with entered PIN
      if (!login(pin)) {
        setShowError(true);
        
        // Show error toast
        toast({
          title: "Code PIN incorrect",
          description: "Veuillez réessayer.",
          variant: "destructive",
        });
        
        // Reset PIN after a short delay
        setTimeout(() => {
          setPin("");
        }, 800);
      }
    }
  }, [pin, login, toast]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const numberPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-8 mx-auto bg-card rounded-2xl shadow-xl fade-in">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">Coralie & Léo</h1>
          <p className="text-muted-foreground">Veuillez entrer votre code PIN</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-center items-center space-x-3 mb-6">
            {Array.from({ length: pinDigits }).map((_, idx) => (
              <div 
                key={`pin-dot-${idx}`}
                className={`w-3 h-3 rounded-full pin-dot ${
                  idx < pin.length 
                    ? "bg-primary" 
                    : "bg-muted dark:bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {numberPad.map((num, idx) => {
              if (num === "") {
                // Empty button
                return <div key={`empty-${idx}`} className="h-16"></div>;
              } else if (num === "del") {
                // Delete button
                return (
                  <button
                    key="delete"
                    onClick={handleDelete}
                    className="h-16 rounded-xl bg-secondary dark:bg-secondary hover:bg-destructive hover:text-white transition-colors flex items-center justify-center"
                    aria-label="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L21 12m-9 5l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2" />
                    </svg>
                  </button>
                );
              } else {
                // Number button
                return (
                  <button
                    key={`num-${num}`}
                    onClick={() => handleNumberClick(num.toString())}
                    className="h-16 rounded-xl bg-secondary dark:bg-secondary hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors font-bold text-xl"
                  >
                    {num}
                  </button>
                );
              }
            })}
          </div>
        </div>
        
        {showError && (
          <div className="text-center text-destructive mt-4 fade-in">
            Code PIN incorrect, veuillez réessayer.
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button 
            onClick={toggleTheme}
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 mr-2" />
                <span>Mode clair</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 mr-2" />
                <span>Mode sombre</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinScreen;

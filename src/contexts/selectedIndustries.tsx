import { getUserPreferences, saveUserPreferences } from '@/lib/api';
import { useState, useEffect } from 'react';

// Custom hook for managing selected industries
export const useSelectedIndustries = (user: any, token: string | null) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError(null);
      
      if (user && token) {
        try {
          const preferences = await getUserPreferences(token);
          setSelectedIndustries(preferences.selected_categories || []);
        } catch (error) {
          console.error('Error loading preferences:', error);
          setError('Failed to load preferences');
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem("selectedIndustries");
          setSelectedIndustries(stored ? JSON.parse(stored) : []);
        }
      } else {
        const stored = localStorage.getItem("selectedIndustries");
        setSelectedIndustries(stored ? JSON.parse(stored) : []);
      }
      
      setLoading(false);
    };

    loadPreferences();
  }, [user, token]);

  // Function to update selected industries
  const updateSelectedIndustries = (industries: string[] | ((prev: string[]) => string[])) => {
    if (typeof industries === 'function') {
      setSelectedIndustries(prev => {
        const updated = industries(prev);
        // Sync with localStorage for non-authenticated users
        if (!user || !token) {
          localStorage.setItem("selectedIndustries", JSON.stringify(updated));
        }
        return updated;
      });
    } else {
      setSelectedIndustries(industries);
      // Sync with localStorage for non-authenticated users
      if (!user || !token) {
        localStorage.setItem("selectedIndustries", JSON.stringify(industries));
      }
    }
  };

  // Function to toggle a specific industry
  const toggleIndustry = async (industryId: string) => {
    updateSelectedIndustries(prev => {
      const updated = prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId];
      
      // Save to backend if user is signed in
      if (user && token) {
        saveUserPreferences(token, {
          selected_categories: updated
        }).catch(error => {
          console.error('Error saving preferences:', error);
          // You might want to pass a toast function as a parameter or use a global toast
          // toast({
          //   title: "Error",
          //   description: "Failed to save preferences",
          //   variant: "destructive",
          // });
        });
      }
      
      return updated;
    });
  };

  return {
    selectedIndustries,
    setSelectedIndustries: updateSelectedIndustries,
    toggleIndustry,
    loading,
    error,
  };
};

// Usage in components:
// const { selectedIndustries, setSelectedIndustries, loading, error } = useSelectedIndustries(user, token);
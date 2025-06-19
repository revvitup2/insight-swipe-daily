import { getUserPreferences, saveUserPreferences } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

// Global cache to store preferences across component instances
const preferencesCache = new Map<string, string[]>();

// Custom hook for managing selected industries with caching
export const useSelectedIndustries = (user: any, token: string | null) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create a cache key based on user
  const cacheKey = user?.id || user?.email || 'anonymous';

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError(null);
      
      // Check cache first
      if (preferencesCache.has(cacheKey)) {
        const cachedPreferences = preferencesCache.get(cacheKey)!;
        setSelectedIndustries(cachedPreferences);
        setLoading(false);
        return;
      }

      // Always start with localStorage data
      const stored = localStorage.getItem("selectedIndustries");
      const storedCategories = stored ? JSON.parse(stored) : [];
      setSelectedIndustries(storedCategories);
      preferencesCache.set(cacheKey, storedCategories);

      // If user is authenticated, fetch from API and update localStorage
      if (user && token) {
        try {
          const preferences = await getUserPreferences(token);
          const categories = preferences.selected_categories || [];
          
          // Update state, cache, and localStorage with API data
          setSelectedIndustries(categories);
          preferencesCache.set(cacheKey, categories);
          localStorage.setItem("selectedIndustries", JSON.stringify(categories));
        } catch (error) {
          console.error('Error loading preferences:', error);
          setError('Failed to load preferences');
          // Continue using localStorage data that was already set
        }
      }
      
      setLoading(false);
    };

    loadPreferences();
  }, [user, token, cacheKey]);

  // Function to update selected industries locally (no API call)
  const updateSelectedIndustries = useCallback((industries: string[] | ((prev: string[]) => string[])) => {
    setSelectedIndustries(prev => {
      const updated = typeof industries === 'function' ? industries(prev) : industries;
      
      // Update cache
      preferencesCache.set(cacheKey, updated);
      
      // Always sync with localStorage (for both authenticated and non-authenticated users)
      localStorage.setItem("selectedIndustries", JSON.stringify(updated));
      
      // Mark as having unsaved changes for authenticated users
      if (user && token) {
        setHasUnsavedChanges(true);
      }
      
      return updated;
    });
  }, [cacheKey, user, token]);

  // Function to toggle a specific industry (no API call)
// In your useSelectedIndustries hook, modify the toggleIndustry function:
const toggleIndustry = useCallback(async (industryId: string) => {
  setSelectedIndustries(prev => {
    const updated = prev.includes(industryId)
      ? prev.filter(id => id !== industryId)
      : [...prev, industryId];
    
    // Update cache and localStorage immediately
    preferencesCache.set(cacheKey, updated);
    localStorage.setItem("selectedIndustries", JSON.stringify(updated));
    
    return updated;
  });

  // If authenticated, save to backend immediately
  if (user && token) {
    try {
      setSaving(true);
      await saveUserPreferences(token, {
        selected_categories: selectedIndustries.includes(industryId)
          ? selectedIndustries.filter(id => id !== industryId)
          : [...selectedIndustries, industryId]
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
      // Optionally revert the change if save fails
    } finally {
      setSaving(false);
    }
  }
}, [user, token, selectedIndustries, cacheKey]);


  // Function to explicitly save preferences to backend
  const savePreferences = useCallback(async () => {
    if (!user || !token || !hasUnsavedChanges) {
      return { success: true, message: 'No changes to save' };
    }

    setSaving(true);
    setError(null);

    try {
      await saveUserPreferences(token, {
        selected_categories: selectedIndustries
      });
      
      setHasUnsavedChanges(false);
      setSaving(false);
      return { success: true, message: 'Preferences saved successfully' };
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
      setSaving(false);
      return { success: false, message: 'Failed to save preferences' };
    }
  }, [user, token, hasUnsavedChanges, selectedIndustries]);

  // Function to reset to cached/saved state
  const resetToSaved = useCallback(() => {
    if (user && token) {
      // Reset to the cached version (which represents the last saved state)
      const cachedPreferences = preferencesCache.get(cacheKey) || [];
      setSelectedIndustries(cachedPreferences);
      setHasUnsavedChanges(false);
    }
  }, [user, token, cacheKey]);

  // Function to clear cache (useful for logout scenarios)
  const clearCache = useCallback(() => {
    preferencesCache.delete(cacheKey);
  }, [cacheKey]);

  return {
    selectedIndustries,
    setSelectedIndustries: updateSelectedIndustries,
    toggleIndustry,
    savePreferences,
    resetToSaved,
    clearCache,
    loading,
    saving,
    error,
    hasUnsavedChanges,
  };
};

// Usage in components:
// const { 
//   selectedIndustries, 
//   toggleIndustry, 
//   savePreferences,
//   hasUnsavedChanges,
//   saving,
//   loading, 
//   error 
// } = useSelectedIndustries(user, token);

// Example component usage:
/*
function MyComponent() {
  const { 
    selectedIndustries, 
    toggleIndustry, 
    savePreferences,
    hasUnsavedChanges,
    saving,
    loading 
  } = useSelectedIndustries(user, token);

  const handleSave = async () => {
    const result = await savePreferences();
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {selectedIndustries.map(industry => (
        <button key={industry} onClick={() => toggleIndustry(industry)}>
          {industry}
        </button>
      ))}
      
      {hasUnsavedChanges && (
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}
*/
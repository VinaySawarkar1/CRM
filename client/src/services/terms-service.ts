import { apiRequest } from "@/lib/queryClient";

export interface Term {
  id: number;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermData {
  title: string;
  description: string;
  category: string;
  isActive: boolean;
}

export interface UpdateTermData extends Partial<CreateTermData> {
  id: number;
}

// Default terms that come with the system
export const defaultTerms: Term[] = [
  {
    id: 1,
    title: "Installation & Commissioning",
    description: "Installation and commissioning services are not included in the quoted price and will be charged separately.",
    category: "Services",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Payment Terms",
    description: "50% Advance payment along with PO, Balance 50% and applicable taxes before delivery.",
    category: "Payment",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Delivery Time",
    description: "Delivery time is subject to stock availability and may vary based on order quantity and specifications.",
    category: "Delivery",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Warranty",
    description: "Standard warranty of 12 months from the date of delivery, covering manufacturing defects only.",
    category: "Warranty",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Returns Policy",
    description: "Returns accepted within 7 days of delivery for defective items only. Return shipping costs borne by customer.",
    category: "Returns",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const categories = ["Services", "Payment", "Delivery", "Warranty", "Returns", "General", "Custom"];

// Local storage key for terms
const TERMS_STORAGE_KEY = 'reckonix_terms_conditions';

// Get terms from local storage or use defaults
export const getTerms = (): Term[] => {
  try {
    const stored = localStorage.getItem(TERMS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default terms if none exist
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(defaultTerms));
    return defaultTerms;
  } catch (error) {
    console.error('Error loading terms from storage:', error);
    return defaultTerms;
  }
};

// Save terms to local storage
export const saveTerms = (terms: Term[]): void => {
  try {
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(terms));
  } catch (error) {
    console.error('Error saving terms to storage:', error);
  }
};

// Add a new term
export const addTerm = (termData: CreateTermData): Term => {
  const terms = getTerms();
  const newTerm: Term = {
    ...termData,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const updatedTerms = [...terms, newTerm];
  saveTerms(updatedTerms);
  return newTerm;
};

// Update an existing term
export const updateTerm = (termData: UpdateTermData): Term | null => {
  const terms = getTerms();
  const termIndex = terms.findIndex(t => t.id === termData.id);
  if (termIndex === -1) return null;
  
  const updatedTerm: Term = {
    ...terms[termIndex],
    ...termData,
    updatedAt: new Date().toISOString()
  };
  
  const updatedTerms = [...terms];
  updatedTerms[termIndex] = updatedTerm;
  saveTerms(updatedTerms);
  return updatedTerm;
};

// Delete a term
export const deleteTerm = (id: number): boolean => {
  const terms = getTerms();
  const updatedTerms = terms.filter(t => t.id !== id);
  if (updatedTerms.length === terms.length) return false;
  
  saveTerms(updatedTerms);
  return true;
};

// Toggle term active status
export const toggleTermActive = (id: number): Term | null => {
  const terms = getTerms();
  const termIndex = terms.findIndex(t => t.id === id);
  if (termIndex === -1) return null;
  
  const updatedTerm: Term = {
    ...terms[termIndex],
    isActive: !terms[termIndex].isActive,
    updatedAt: new Date().toISOString()
  };
  
  const updatedTerms = [...terms];
  updatedTerms[termIndex] = updatedTerm;
  saveTerms(updatedTerms);
  return updatedTerm;
};

// Get active terms only
export const getActiveTerms = (): Term[] => {
  return getTerms().filter(term => term.isActive);
};

// Get terms by category
export const getTermsByCategory = (category: string): Term[] => {
  if (category === 'all') return getTerms();
  return getTerms().filter(term => term.category === category);
};

// Search terms
export const searchTerms = (query: string): Term[] => {
  const terms = getTerms();
  const lowercaseQuery = query.toLowerCase();
  return terms.filter(term => 
    term.title.toLowerCase().includes(lowercaseQuery) ||
    term.description.toLowerCase().includes(lowercaseQuery)
  );
};

// Reset to default terms
export const resetToDefaults = (): Term[] => {
  saveTerms(defaultTerms);
  return defaultTerms;
};

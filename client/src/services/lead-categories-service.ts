const STORAGE_KEY = "leadCategories:v1";

export type LeadCategory = {
  id: string;
  name: string;
  isActive: boolean;
};

function load(): LeadCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCategories();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultCategories();
    return parsed;
  } catch {
    return defaultCategories();
  }
}

function save(list: LeadCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function defaultCategories(): LeadCategory[] {
  return [
    { id: "industry", name: "Industry", isActive: true },
    { id: "calibration_labs", name: "Calibration Labs", isActive: true },
    { id: "vision_measuring_machine", name: "Vision Measuring Machine", isActive: true },
    { id: "data_logger", name: "Data Logger", isActive: true },
    { id: "calibration_software", name: "Calibration Software", isActive: true },
    { id: "meatest", name: "Meatest", isActive: true },
    { id: "finalization", name: "Finalization", isActive: true },
    { id: "waiting_for_po", name: "Waiting for PO", isActive: true },
  ];
}

export function getActiveLeadCategories(): LeadCategory[] {
  return load().filter((c) => c.isActive);
}

export function getAllLeadCategories(): LeadCategory[] {
  return load();
}

export function addLeadCategory(name: string): LeadCategory {
  const list = load();
  const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const cat: LeadCategory = { id, name: name.trim(), isActive: true };
  list.push(cat);
  save(list);
  return cat;
}

export function updateLeadCategory(id: string, updates: Partial<LeadCategory>): LeadCategory | null {
  const list = load();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  save(list);
  return list[idx];
}

export function deleteLeadCategory(id: string) {
  const list = load().filter((c) => c.id !== id);
  save(list);
}

export function resetLeadCategories() {
  save(defaultCategories());
}





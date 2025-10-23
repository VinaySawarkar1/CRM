import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Save, X, RotateCcw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { 
  getTerms, 
  addTerm, 
  updateTerm, 
  deleteTerm, 
  toggleTermActive, 
  getTermsByCategory, 
  searchTerms, 
  resetToDefaults,
  categories,
  type Term 
} from '../services/terms-service';

export default function TermsConditionsManager() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Load terms on component mount
  useEffect(() => {
    setTerms(getTerms());
  }, []);

  // Filter terms based on search and category
  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTerm = (newTerm: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>) => {
    const term = addTerm(newTerm);
    setTerms(getTerms());
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Term added successfully",
    });
  };

  const handleEditTerm = (updatedTerm: Term) => {
    const result = updateTerm(updatedTerm);
    if (result) {
      setTerms(getTerms());
      setEditingTerm(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Term updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update term",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTerm = (id: number) => {
    const success = deleteTerm(id);
    if (success) {
      setTerms(getTerms());
      toast({
        title: "Success",
        description: "Term deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete term",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = (id: number) => {
    const result = toggleTermActive(id);
    if (result) {
      setTerms(getTerms());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Terms & Conditions Management</span>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  resetToDefaults();
                  setTerms(getTerms());
                  toast({
                    title: "Reset Complete",
                    description: "Terms have been reset to defaults",
                  });
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Term
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Term & Condition</DialogTitle>
                  </DialogHeader>
                  <AddTermForm onSubmit={handleAddTerm} onCancel={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Terms List */}
      <div className="grid gap-4">
        {filteredTerms.map(term => (
          <Card key={term.id} className={`${!term.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{term.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      term.category === 'Payment' ? 'bg-red-100 text-red-800' :
                      term.category === 'Warranty' ? 'bg-green-100 text-green-800' :
                      term.category === 'Delivery' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {term.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      term.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {term.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{term.description}</p>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(term.createdAt).toLocaleDateString()} | 
                    Updated: {new Date(term.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingTerm(term);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(term.id)}
                  >
                    {term.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Term</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{term.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTerm(term.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Term & Condition</DialogTitle>
          </DialogHeader>
          {editingTerm && (
            <EditTermForm 
              term={editingTerm} 
              onSubmit={handleEditTerm} 
              onCancel={() => {
                setEditingTerm(null);
                setIsEditDialogOpen(false);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Term Form Component
function AddTermForm({ onSubmit, onCancel }: { 
  onSubmit: (term: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter term title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description"
          rows={4}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Add Term
        </Button>
      </div>
    </form>
  );
}

// Edit Term Form Component
function EditTermForm({ term, onSubmit, onCancel }: { 
  term: Term;
  onSubmit: (term: Term) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(term.title);
  const [description, setDescription] = useState(term.description);
  const [category, setCategory] = useState(term.category);
  const [isActive, setIsActive] = useState(term.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onSubmit({
      ...term,
      title: title.trim(),
      description: description.trim(),
      category,
      isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Title *</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter term title"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-description">Description *</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description"
          rows={4}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-category">Category</Label>
        <select
          id="edit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="edit-isActive">Active</Label>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Update Term
        </Button>
      </div>
    </form>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Search, Plus, X } from 'lucide-react';
import { getActiveTerms, addTerm, type Term } from '../../services/terms-service';

interface TermsSelectorProps {
  selectedTerms: string[];
  onTermsChange: (terms: string[]) => void;
  placeholder?: string;
}

export default function TermsSelector({ selectedTerms, onTermsChange, placeholder = "Select terms and conditions" }: TermsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableTerms, setAvailableTerms] = useState<Term[]>([]);
  const [newTerm, setNewTerm] = useState<string>("");

  useEffect(() => {
    setAvailableTerms(getActiveTerms());
  }, []);

  const filteredTerms = availableTerms.filter(term =>
    term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTermToggle = (termTitle: string, checked: boolean) => {
    if (checked) {
      onTermsChange([...selectedTerms, termTitle]);
    } else {
      onTermsChange(selectedTerms.filter(t => t !== termTitle));
    }
  };

  const handleRemoveTerm = (termTitle: string) => {
    onTermsChange(selectedTerms.filter(t => t !== termTitle));
  };

  // Point-by-point display: each term on its own line (still inline visually)
  const getInlineTerms = () => selectedTerms.join(' \n ');

  return (
    <div className="space-y-3">
      <Label>Terms & Conditions</Label>
      
      {/* Selected Terms Single-Line Display */}
      {selectedTerms.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm flex items-start justify-between gap-3">
          <div className="flex-1 whitespace-pre-line leading-5">
            {getInlineTerms()}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onTermsChange([])} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Terms Selector Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            {selectedTerms.length > 0 ? `${selectedTerms.length} terms selected` : placeholder}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Terms & Conditions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick add new term (title only) */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new term (title only)"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => {
                  const title = newTerm.trim();
                  if (!title) return;
                  const created = addTerm({ title, description: "", category: "Custom", isActive: true });
                  setAvailableTerms(getActiveTerms());
                  onTermsChange([...selectedTerms, created.title]);
                  setNewTerm("");
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {/* Terms List with only titles (no descriptions) */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredTerms.map((term) => (
                  <div key={term.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`term-${term.id}`}
                      checked={selectedTerms.includes(term.title)}
                      onCheckedChange={(checked) => handleTermToggle(term.title, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`term-${term.id}`} 
                        className="font-medium text-sm cursor-pointer"
                      >
                        {term.title}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="text-sm text-gray-600">
              {selectedTerms.length > 0 ? (
                <span>{selectedTerms.length} term(s) selected</span>
              ) : (
                <span>No terms selected</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

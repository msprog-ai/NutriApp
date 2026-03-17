"use client";

import { useState } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { BottomNav } from '@/components/layout/bottom-nav';
import { InventoryItemCard } from '@/components/nutrifridge/inventory-item-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { InventoryItem, IngredientCategory, StorageLocation } from '@/types/app';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { inventory, addInventoryItem, loading } = useAppData();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'vegetables',
    quantity: 1,
    unit: 'pcs',
    expirationDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    location: 'fridge',
    notes: ''
  });

  if (loading) return null;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  const handleAddItem = async () => {
    if (!newItem.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    try {
      await addInventoryItem(newItem as any);
      setIsAddOpen(false);
      setNewItem({
        name: '',
        category: 'vegetables',
        quantity: 1,
        unit: 'pcs',
        expirationDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        location: 'fridge',
        notes: ''
      });
      toast({ title: "Item added to inventory" });
    } catch (e) {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
  };

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Inventory</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full w-10 h-10">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-sm mx-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input 
                  placeholder="e.g. Tomatoes" 
                  value={newItem.name}
                  onChange={e => setNewItem(p => ({...p, name: e.target.value}))}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newItem.category}
                    onValueChange={v => setNewItem(p => ({...p, category: v as IngredientCategory}))}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'condiments', 'pantry items', 'frozen goods', 'other'].map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select 
                    value={newItem.location}
                    onValueChange={v => setNewItem(p => ({...p, location: v as StorageLocation}))}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fridge">Fridge</SelectItem>
                      <SelectItem value="freezer">Freezer</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    value={newItem.quantity}
                    onChange={e => setNewItem(p => ({...p, quantity: Number(e.target.value)}))}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input 
                    placeholder="pcs, kg..." 
                    value={newItem.unit}
                    onChange={e => setNewItem(p => ({...p, unit: e.target.value}))}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Input 
                  type="date" 
                  onChange={e => setNewItem(p => ({...p, expirationDate: new Date(e.target.value).toISOString()}))}
                  className="rounded-xl h-11"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddItem} className="w-full rounded-2xl h-12 text-lg font-bold">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search ingredients..." 
            className="pl-10 rounded-2xl h-12 bg-white border-none shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-12 h-12 rounded-2xl p-0 bg-white border-none shadow-sm flex items-center justify-center">
            <Filter className="w-5 h-5" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {['vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'condiments', 'pantry items', 'frozen goods', 'other'].map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredInventory.length > 0 ? (
          filteredInventory.map(item => (
            <InventoryItemCard key={item.id} item={item} />
          ))
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <RefrigeratorIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No items found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try changing your filters or add a new ingredient to get started.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function RefrigeratorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/><path d="M5 10h14"/><path d="M15 7v6"/><path d="M15 15v3"/></svg>
  )
}
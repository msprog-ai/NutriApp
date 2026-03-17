"use client";

import { useState } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { InventoryItemCard } from '@/components/nutrifridge/inventory-item-card';
import { CameraCapture } from '@/components/nutrifridge/camera-capture';
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
import { Plus, Search, Filter, Loader2, Camera, ScanLine } from 'lucide-react';
import { InventoryItem, IngredientCategory, StorageLocation } from '@/types/app';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function InventoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'vegetables',
    quantity: 1,
    unit: 'pcs',
    expirationDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    location: 'fridge',
    notes: ''
  });

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'inventory_items');
  }, [firestore, user]);

  const { data: inventory, isLoading: isInventoryLoading } = useCollection<InventoryItem>(inventoryQuery);

  if (isUserLoading || isInventoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredInventory = (inventory || [])
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  const handleAddItem = async () => {
    if (!newItem.name || !user || !firestore) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const colRef = collection(firestore, 'users', user.uid, 'inventory_items');
    const data = {
      ...newItem,
      userId: user.uid,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addDocumentNonBlocking(colRef, data);
    
    setIsAddOpen(false);
    resetNewItem();
    toast({ title: "Item added to inventory" });
  };

  const resetNewItem = () => {
    setNewItem({
      name: '',
      category: 'vegetables',
      quantity: 1,
      unit: 'pcs',
      expirationDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      location: 'fridge',
      notes: ''
    });
  };

  const handleScanCapture = (imageData: string) => {
    setIsScannerOpen(false);
    setIsAddOpen(true);
    // In a real app, you might use Vision AI here to identify the object
    setNewItem(p => ({ ...p, notes: 'Scanned from photo' }));
    toast({ title: "Photo captured!", description: "Add item details manually below." });
  };

  return (
    <div className="pb-24 pt-4 px-6 max-w-md mx-auto min-h-screen flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Inventory</h1>
          <p className="text-sm text-muted-foreground">{filteredInventory.length} items tracked</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-10 h-10 border-primary/20 bg-white"
            onClick={() => setIsScannerOpen(true)}
          >
            <ScanLine className="w-5 h-5 text-primary" />
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full w-10 h-10 shadow-lg ios-tap-active">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-sm mx-auto p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Name</Label>
                  <Input 
                    placeholder="e.g. Tomatoes" 
                    value={newItem.name}
                    onChange={e => setNewItem(p => ({...p, name: e.target.value}))}
                    className="rounded-2xl h-12 bg-muted/50 border-none px-4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                    <Select 
                      value={newItem.category}
                      onValueChange={v => setNewItem(p => ({...p, category: v as IngredientCategory}))}
                    >
                      <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-none px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {['vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'condiments', 'pantry items', 'frozen goods', 'other'].map(c => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</Label>
                    <Select 
                      value={newItem.location}
                      onValueChange={v => setNewItem(p => ({...p, location: v as StorageLocation}))}
                    >
                      <SelectTrigger className="rounded-2xl h-12 bg-muted/50 border-none px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="fridge">Fridge</SelectItem>
                        <SelectItem value="freezer">Freezer</SelectItem>
                        <SelectItem value="pantry">Pantry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                    <Input 
                      type="number" 
                      value={newItem.quantity}
                      onChange={e => setNewItem(p => ({...p, quantity: Number(e.target.value)}))}
                      className="rounded-2xl h-12 bg-muted/50 border-none px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
                    <Input 
                      placeholder="pcs, kg..." 
                      value={newItem.unit}
                      onChange={e => setNewItem(p => ({...p, unit: e.target.value}))}
                      className="rounded-2xl h-12 bg-muted/50 border-none px-4"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry Date</Label>
                  <Input 
                    type="date" 
                    onChange={e => setNewItem(p => ({...p, expirationDate: new Date(e.target.value).toISOString()}))}
                    className="rounded-2xl h-12 bg-muted/50 border-none px-4"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem} className="w-full rounded-2xl h-14 text-lg font-bold ios-tap-active">Save Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-12 rounded-2xl h-14 bg-white border-none shadow-sm mobile-card-shadow"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-14 h-14 rounded-2xl p-0 bg-white border-none shadow-sm mobile-card-shadow flex items-center justify-center ios-tap-active">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All</SelectItem>
            {['vegetables', 'fruits', 'meat', 'seafood', 'dairy', 'condiments', 'pantry items', 'frozen goods', 'other'].map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {filteredInventory.length > 0 ? (
          filteredInventory.map(item => (
            <div key={item.id} className="ios-tap-active">
              <InventoryItemCard item={item} />
            </div>
          ))
        ) : (
          <div className="text-center py-20 px-10">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <RefrigeratorIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-xl">Your fridge is empty</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Tap the plus button or use the scanner to start tracking your ingredients.</p>
          </div>
        )}
      </div>

      {isScannerOpen && (
        <CameraCapture 
          onCapture={handleScanCapture} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      <BottomNav />
    </div>
  );
}

function RefrigeratorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z"/><path d="M5 10h14"/><path d="M15 7v6"/><path d="M15 15v3"/></svg>
  )
}

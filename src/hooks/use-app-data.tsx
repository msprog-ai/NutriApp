"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, UserProfile, ShoppingListItem, MealPlan } from '@/types/app';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

interface AppDataContextType {
  user: User | null;
  profile: UserProfile | null;
  inventory: InventoryItem[];
  shoppingList: ShoppingListItem[];
  mealPlans: MealPlan[];
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'userId'>) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'userId'>) => Promise<void>;
  toggleShoppingItem: (id: string, bought: boolean) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Load Profile
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }

        // Inventory Subscription
        const invQuery = query(collection(db, 'inventory'), where('userId', '==', u.uid));
        const unsubInv = onSnapshot(invQuery, (snap) => {
          setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[]);
        });

        // Shopping Subscription
        const shopQuery = query(collection(db, 'shopping'), where('userId', '==', u.uid));
        const unsubShop = onSnapshot(shopQuery, (snap) => {
          setShoppingList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShoppingListItem[]);
        });

        return () => {
          unsubInv();
          unsubShop();
        };
      } else {
        setProfile(null);
        setInventory([]);
        setShoppingList([]);
        setMealPlans([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const profileRef = doc(db, 'profiles', user.uid);
    const updated = { ...profile, ...data, uid: user.uid };
    await setDoc(profileRef, updated, { merge: true });
    setProfile(updated as UserProfile);
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'inventory'), { ...item, userId: user.uid });
  };

  const updateInventoryItem = async (id: string, data: Partial<InventoryItem>) => {
    const ref = doc(db, 'inventory', id);
    await updateDoc(ref, data);
  };

  const deleteInventoryItem = async (id: string) => {
    const ref = doc(db, 'inventory', id);
    await deleteDoc(ref);
  };

  const addToShoppingList = async (item: Omit<ShoppingListItem, 'id' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'shopping'), { ...item, userId: user.uid, bought: false });
  };

  const toggleShoppingItem = async (id: string, bought: boolean) => {
    const ref = doc(db, 'shopping', id);
    await updateDoc(ref, { bought });
  };

  return (
    <AppDataContext.Provider value={{ 
      user, profile, inventory, shoppingList, mealPlans, loading,
      updateProfile, addInventoryItem, updateInventoryItem, deleteInventoryItem,
      addToShoppingList, toggleShoppingItem
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
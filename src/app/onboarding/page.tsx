"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/types/app';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const STEPS = 5;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    ageRange: '',
    healthGoals: [],
    dietPreferences: [],
    healthConcerns: [],
    allergies: [],
    foodsToAvoid: [],
    preferredCuisine: [],
    cookingSkillLevel: 'beginner',
    householdSize: 1,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleSelection = (field: keyof UserProfile, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleComplete = async () => {
    if (!user || !firestore) return;
    
    const profileRef = doc(firestore, 'user_profiles', user.uid);
    const data = {
      ...formData,
      id: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any;

    setDocumentNonBlocking(profileRef, data, { merge: true });
    router.push('/');
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">First, tell us about yourself</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input 
                  placeholder="e.g. Alex" 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select onValueChange={v => setFormData(p => ({...p, ageRange: v}))}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under 18">Under 18</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input 
                    type="number" 
                    placeholder="175"
                    onChange={e => setFormData(p => ({...p, height: Number(e.target.value)}))}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input 
                    type="number" 
                    placeholder="70"
                    onChange={e => setFormData(p => ({...p, weight: Number(e.target.value)}))}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What are your health goals?</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Weight Loss', 'Muscle Gain', 'Better Sleep', 'More Energy', 'Lower Cholesterol', 'Sugar Control'].map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleSelection('healthGoals', goal)}
                  className={cn(
                    "p-4 rounded-2xl border text-sm font-medium transition-all text-left",
                    formData.healthGoals?.includes(goal) ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dietary Preferences</h2>
            <div className="grid grid-cols-2 gap-3">
              {['low carb', 'low sugar', 'low sodium', 'high protein', 'vegetarian', 'pescatarian', 'dairy-free', 'gluten-free', 'vegan', 'keto'].map(diet => (
                <button
                  key={diet}
                  onClick={() => toggleSelection('dietPreferences', diet)}
                  className={cn(
                    "p-4 rounded-2xl border text-sm font-medium transition-all text-left capitalize",
                    formData.dietPreferences?.includes(diet) ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border"
                  )}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Health Concerns & Allergies</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Concerns</Label>
                <div className="flex flex-wrap gap-2">
                  {['diabetes', 'high blood pressure', 'high cholesterol', 'kidney concerns', 'celiac disease'].map(concern => (
                    <Badge 
                      key={concern}
                      onClick={() => toggleSelection('healthConcerns', concern)}
                      className={cn(
                        "cursor-pointer px-4 py-2 rounded-full text-xs transition-all border-none capitalize",
                        formData.healthConcerns?.includes(concern) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Common Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {['Peanuts', 'Tree Nuts', 'Shellfish', 'Dairy', 'Soy', 'Wheat', 'Eggs'].map(allergy => (
                    <Badge 
                      key={allergy}
                      onClick={() => toggleSelection('allergies', allergy)}
                      className={cn(
                        "cursor-pointer px-4 py-2 rounded-full text-xs transition-all border-none",
                        formData.allergies?.includes(allergy) ? "bg-destructive text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cooking & Household</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cooking Skill Level</Label>
                <Select onValueChange={v => setFormData(p => ({...p, cookingSkillLevel: v as any}))}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Beginner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Household Size (people)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={formData.householdSize}
                  onChange={e => setFormData(p => ({...p, householdSize: Number(e.target.value)}))}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Cuisines</Label>
                <div className="flex flex-wrap gap-2">
                  {['Italian', 'Mexican', 'Asian', 'Mediterranean', 'French', 'Indian'].map(c => (
                    <Badge 
                      key={c}
                      onClick={() => toggleSelection('preferredCuisine', c)}
                      className={cn(
                        "cursor-pointer px-4 py-2 rounded-full text-xs transition-all border-none",
                        formData.preferredCuisine?.includes(c) ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 max-w-md mx-auto flex flex-col">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Onboarding</span>
          <span className="text-xs font-medium text-muted-foreground">{step} of {STEPS}</span>
        </div>
        <Progress value={(step / STEPS) * 100} className="h-2" />
      </div>

      <div className="flex-1">
        {renderStep()}
      </div>

      <div className="py-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" className="rounded-2xl h-14 w-20" onClick={prevStep}>
            <ChevronLeft />
          </Button>
        )}
        {step < STEPS ? (
          <Button className="flex-1 rounded-2xl h-14 text-lg font-bold" onClick={nextStep}>
            Next <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <Button className="flex-1 rounded-2xl h-14 text-lg font-bold" onClick={handleComplete}>
            Complete Profile <CheckCircle2 className="ml-2 w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

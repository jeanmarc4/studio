
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { FamilyProfile, User } from '@/types';

// The shape of the data returned by the hook
interface UseProfileReturn {
  profiles: FamilyProfile[];
  activeProfile: FamilyProfile | null;
  setActiveProfile: (profileId: string) => void;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'santeconnect-active-profile-id';

/**
 * A hook to manage family profiles for the current user.
 * It fetches all profiles, manages which one is active,
 * and persists the active choice to localStorage.
 */
export function useProfile(): UseProfileReturn {
  const { user, firestore, isUserLoading } = useFirebase();
  const [activeProfile, setActiveProfile] = useState<FamilyProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Get the current user's own profile document
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: currentUserProfile, isLoading: isCurrentUserProfileLoading } = useDoc<User>(userProfileRef);

  // 2. Get all family profiles from the subcollection
  const profilesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'profiles');
  }, [user, firestore]);
  const { data: familyProfiles, isLoading: areFamilyProfilesLoading } = useCollection<FamilyProfile>(profilesQuery);

  // 3. Combine the user's own profile and family profiles into one list
  const allProfiles: FamilyProfile[] = useMemo(() => {
    if (!currentUserProfile) return [];
    
    // Create a FamilyProfile object from the main User object
    const selfProfile: FamilyProfile = {
      id: currentUserProfile.id,
      name: `${currentUserProfile.firstName} (Vous)`,
      relationship: 'self',
    };

    return [selfProfile, ...(familyProfiles || [])];

  }, [currentUserProfile, familyProfiles]);


  // 4. Initialize active profile from localStorage or default to self
  useEffect(() => {
    const dataIsLoading = isUserLoading || isCurrentUserProfileLoading || areFamilyProfilesLoading;
    if (dataIsLoading) {
      return; // Wait until all data is loaded
    }
  
    // Only run this logic on the client side
    if (typeof window !== 'undefined') {
      if (!user || allProfiles.length === 0) {
        setActiveProfile(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        const storedProfileId = localStorage.getItem(LOCAL_STORAGE_KEY);
        const profileToActivate = allProfiles.find(p => p.id === storedProfileId) || allProfiles[0];
        
        setActiveProfile(profileToActivate);
        // Ensure localStorage is in sync
        if (profileToActivate) {
          localStorage.setItem(LOCAL_STORAGE_KEY, profileToActivate.id);
        }
      }
      setIsInitializing(false);
    }
  }, [user, allProfiles, isUserLoading, isCurrentUserProfileLoading, areFamilyProfilesLoading]);


  // 5. Create a stable function to set the active profile
  const handleSetActiveProfile = useCallback((profileId: string) => {
    const newActiveProfile = allProfiles.find(p => p.id === profileId);
    if (newActiveProfile) {
      setActiveProfile(newActiveProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY, profileId);
    }
  }, [allProfiles]);

  return {
    profiles: allProfiles,
    activeProfile,
    setActiveProfile: handleSetActiveProfile,
    isLoading: isInitializing || isUserLoading || isCurrentUserProfileLoading || areFamilyProfilesLoading,
  };
}

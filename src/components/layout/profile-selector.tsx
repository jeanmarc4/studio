
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

export function ProfileSelector() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { profiles, activeProfile, setActiveProfile, isLoading } = useProfile();

  if (isLoading) {
    return <Skeleton className="h-9 w-48" />;
  }

  // Do not render the selector if there are no profiles (e.g., user logged out)
  if (!profiles || profiles.length === 0) {
    return null;
  }
  
  const handleProfileSelect = (profileId: string) => {
    setActiveProfile(profileId);
    setOpen(false);
  }
  
  const handleAddNew = () => {
    setOpen(false);
    router.push('/profile');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {activeProfile
            ? profiles.find((p) => p.id === activeProfile.id)?.name
            : "Sélectionner un profil..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Rechercher un profil..." />
            <CommandEmpty>Aucun profil trouvé.</CommandEmpty>
            <CommandGroup heading="Profils familiaux">
              {profiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  onSelect={() => handleProfileSelect(profile.id)}
                  className="text-sm"
                >
                  {profile.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      activeProfile?.id === profile.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
                <CommandItem onSelect={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Gérer les profils
                </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

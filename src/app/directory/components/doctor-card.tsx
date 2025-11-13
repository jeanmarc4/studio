"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Doctor } from "@/lib/data";
import { AppointmentDialog } from "./appointment-dialog";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          {doctor.image && (
            <Image
              src={doctor.image}
              alt={`Photo de ${doctor.name}`}
              width={80}
              height={80}
              className="rounded-full border"
              data-ai-hint={doctor.imageHint}
            />
          )}
          <div className="flex-1">
            <CardTitle className="font-headline text-xl">{doctor.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{doctor.location}</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
            </div>
            <span className="ml-2 text-sm text-muted-foreground">({doctor.reviews} avis)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {doctor.availability.map((day) => (
              <Badge key={day} variant="secondary" className="font-normal">
                {day}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => setIsDialogOpen(true)}
          >
            Prendre Rendez-vous
          </Button>
        </CardFooter>
      </Card>
      <AppointmentDialog 
        doctor={doctor}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

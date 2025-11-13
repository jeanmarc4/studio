import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { doctors } from "@/lib/data";
import { DoctorCard } from "./components/doctor-card";

export default function DirectoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Medical Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Find the right healthcare professional for your needs.</p>
      </header>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, specialty, or location..."
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-12">
          <TabsTrigger value="doctors" className="h-full text-base">Doctors</TabsTrigger>
          <TabsTrigger value="pharmacies" className="h-full text-base">Pharmacies</TabsTrigger>
          <TabsTrigger value="holistic" className="h-full text-base">Holistic Care</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="pharmacies" className="mt-8 text-center">
          <p className="text-muted-foreground">Pharmacy directory coming soon.</p>
        </TabsContent>
        <TabsContent value="holistic" className="mt-8 text-center">
          <p className="text-muted-foreground">Holistic care provider directory coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

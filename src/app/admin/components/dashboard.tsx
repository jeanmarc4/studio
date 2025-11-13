import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, Activity, FileText } from "lucide-react";

const stats = [
    {
        title: "Utilisateurs totaux",
        value: "1,258",
        icon: Users,
        change: "+12.5%",
        description: "par rapport au mois dernier",
    },
    {
        title: "Rendez-vous pris",
        value: "452",
        icon: Calendar,
        change: "+8.2%",
        description: "par rapport au mois dernier",
    },
    {
        title: "Utilisations du vérificateur de symptômes",
        value: "3,489",
        icon: Activity,
        change: "+20.1%",
        description: "par rapport au mois dernier",
    },
    {
        title: "Articles sur le bien-être consultés",
        value: "10,215",
        icon: FileText,
        change: "+5.7%",
        description: "par rapport au mois dernier",
    }
];

export function Dashboard() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                 <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-500">{stat.change}</span> {stat.description}
                      </p>
                    </CardContent>
                  </Card>
            ))}
        </div>
    );
}

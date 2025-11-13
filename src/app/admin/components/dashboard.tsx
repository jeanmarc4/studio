
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, Activity, FileText } from "lucide-react";
import type { User } from '@/docs/backend-documentation';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
    users?: User[] | null;
    areUsersLoading: boolean;
}

export function Dashboard({ users, areUsersLoading }: DashboardProps) {
    const totalUsers = users ? users.length : 0;
    
    const stats = [
        {
            title: "Utilisateurs totaux",
            getValue: () => totalUsers.toLocaleString(),
            icon: Users,
            change: "+12.5%",
            description: "par rapport au mois dernier",
            isLoading: areUsersLoading,
        },
        {
            title: "Rendez-vous pris",
            getValue: () => "452",
            icon: Calendar,
            change: "+8.2%",
            description: "par rapport au mois dernier",
            isLoading: false,
        },
        {
            title: "Utilisations du vérificateur de symptômes",
            getValue: () => "3,489",
            icon: Activity,
            change: "+20.1%",
            description: "par rapport au mois dernier",
            isLoading: false,
        },
        {
            title: "Articles sur le bien-être consultés",
            getValue: () => "10,215",
            icon: FileText,
            change: "+5.7%",
            description: "par rapport au mois dernier",
            isLoading: false,
        }
    ];

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
                      {stat.isLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{stat.getValue()}</div>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">{stat.change}</span> {stat.description}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
            ))}
        </div>
    );
}

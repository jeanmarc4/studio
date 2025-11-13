

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Star, Activity, FileText } from "lucide-react";
import type { User } from '@/docs/backend-documentation';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
    users?: User[] | null;
    areUsersLoading: boolean;
}

export function Dashboard({ users, areUsersLoading }: DashboardProps) {
    const totalUsers = users ? users.length : 0;
    const premiumUsers = users ? users.filter(u => u.role === 'Premium').length : 0;
    const standardUsers = users ? users.filter(u => u.role === 'Standard').length : 0;
    const adminUsers = users ? users.filter(u => u.role === 'Admin').length : 0;
    
    const stats = [
        {
            title: "Utilisateurs totaux",
            getValue: () => totalUsers.toLocaleString(),
            icon: Users,
            description: "Tous plans confondus",
            isLoading: areUsersLoading,
        },
        {
            title: "Abonnés Premium",
            getValue: () => premiumUsers.toLocaleString(),
            icon: Star,
            description: "Utilisateurs avec accès IA",
            isLoading: areUsersLoading,
        },
        {
            title: "Utilisateurs Standard",
            getValue: () => standardUsers.toLocaleString(),
            icon: Users,
            description: "Utilisateurs du plan gratuit",
            isLoading: areUsersLoading,
        },
        {
            title: "Administrateurs",
            getValue: () => adminUsers.toLocaleString(),
            icon: Shield,
            description: "Comptes avec accès admin",
            isLoading: areUsersLoading,
        }
    ];

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                        <>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">{stat.getValue()}</div>
                          <p className="text-xs text-muted-foreground">
                            {stat.description}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
            ))}
        </div>
    );
}

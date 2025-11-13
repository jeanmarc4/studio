import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, UserCog, User } from "lucide-react";

const roles = [
    {
        name: 'Super Admin',
        icon: ShieldCheck,
        description: 'Possède toutes les autorisations, y compris la gestion des autres administrateurs et la configuration des paramètres à l\'échelle du système.',
        permissions: [
            'Gérer tous les utilisateurs et rôles',
            'Configurer les paramètres de la plateforme',
            'Accéder à toutes les données',
            'Gestion complète du contenu',
        ]
    },
    {
        name: 'Admin',
        icon: UserCog,
        description: 'Peut gérer la plupart des aspects de la plateforme, tels que le contenu et les utilisateurs non-super-administrateurs.',
        permissions: [
            'Ajouter/Modifier/Supprimer des utilisateurs non-administrateurs',
            'Gérer le contenu de l\'annuaire médical',
            'Publier des articles sur le bien-être',
            'Voir les analyses de la plateforme',
        ]
    },
    {
        name: 'Modérateur',
        icon: User,
        description: 'A des autorisations limitées, axées sur la modération du contenu et la gestion de la communauté.',
        permissions: [
            'Examiner et approuver le contenu',
            'Gérer le contenu généré par les utilisateurs',
            'Répondre aux tickets de support',
            'Signaler le contenu inapproprié',
        ]
    }
];

export function RoleConfiguration() {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
            <Card key={role.name} className="flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <role.icon className="h-10 w-10 text-primary flex-shrink-0" />
                    <div>
                        <CardTitle className="font-headline">{role.name}</CardTitle>
                        <CardDescription className="mt-1">{role.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <h4 className="font-semibold text-sm mb-3">Autorisations clés :</h4>
                    <ul className="space-y-2">
                        {role.permissions.map((permission) => (
                            <li key={permission} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{permission}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}

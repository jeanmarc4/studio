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
        description: 'Has all permissions, including managing other admins and configuring system-wide settings.',
        permissions: [
            'Manage all users and roles',
            'Configure platform settings',
            'Access all data',
            'Full content management',
        ]
    },
    {
        name: 'Admin',
        icon: UserCog,
        description: 'Can manage most aspects of the platform, such as content and non-super-admin users.',
        permissions: [
            'Add/Edit/Delete non-admin users',
            'Manage medical directory content',
            'Publish wellness articles',
            'View platform analytics',
        ]
    },
    {
        name: 'Moderator',
        icon: User,
        description: 'Has limited permissions, focused on content moderation and community management.',
        permissions: [
            'Review and approve content',
            'Manage user-generated content',
            'Respond to support tickets',
            'Flag inappropriate content',
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
                    <h4 className="font-semibold text-sm mb-3">Key Permissions:</h4>
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

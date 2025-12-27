"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Pill,
  Stethoscope,
  Calendar,
  HeartPulse,
  Settings,
  Shield,
  HelpCircle,
  Sparkles,
  ListTodo,
  FileText,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../icons";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { useMemo } from "react";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-sky-500" },
  { href: "/medications", label: "Médicaments", icon: Pill, color: "text-red-500" },
  { href: "/todos", label: "Tâches", icon: ListTodo, color: "text-amber-500" },
  { href: "/doctors", label: "Médecins", icon: Stethoscope, color: "text-blue-500" },
  { href: "/appointments", label: "Rendez-vous", icon: Calendar, color: "text-indigo-500" },
  { href: "/medical-files", label: "Fichiers", icon: FileText, color: "text-teal-500" },
  { href: "/pathologies", label: "Pathologies", icon: HeartPulse, color: "text-rose-500" },
  { href: "/holistic-care", label: "Soins Holistiques", icon: Sparkles, color: "text-green-500" },
];

const bottomMenuItems = [
  { href: "/settings", label: "Paramètres", icon: Settings, color: "text-gray-500", adminOnly: false },
  { href: "/admin", label: "Admin", icon: Shield, color: "text-gray-500", adminOnly: true },
  { href: "/admin/debug", label: "Debug", icon: Bug, color: "text-gray-500", adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<User>(userDocRef);
  const isAdmin = userData?.role === 'admin';

  const isActive = (href: string) => {
    if (href.startsWith('/admin') && pathname.startsWith('/admin')) {
        return pathname.includes(href);
    }
    return pathname === href;
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-16 items-center justify-center p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <Logo className="w-10 h-10 transition-all" />
          <span className="text-lg font-headline group-data-[state=collapsed]:hidden">Santé Zen</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu className="flex-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isActive(item.href)}
                tooltip={{ children: item.label, className: "text-base p-2" }}
                className="text-base"
              >
                <Link href={item.href}>
                  <item.icon className={cn("w-6 h-6 shrink-0", !isActive(item.href) && item.color)} />
                  <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
           {bottomMenuItems.map((item) => (
            (item.adminOnly && !isAdmin) ? null : (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isActive(item.href)}
                tooltip={{ children: item.label, className: "text-base p-2" }}
                className="text-base"
              >
                <Link href={item.href}>
                  <item.icon className={cn("w-6 h-6 shrink-0", !isActive(item.href) && item.color)} />
                  <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="text-base" tooltip={{ children: "Aide", className: "text-base p-2"}}>
              <HelpCircle className="w-6 h-6 text-gray-500" />
              <span className="group-data-[state=collapsed]:hidden">Aide & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

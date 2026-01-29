"use client"

import * as React from "react"
import { LayoutDashboard, Radio, MapPin, Building2 } from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects" // Not needed for our use case
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher" // Not needed for our use case
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Navigation items matching our application structure
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard" || pathname?.startsWith("/dashboard/"),
      // No nested items - flat navigation
      items: [],
    },
    {
      title: "Beacons",
      url: "/beacons",
      icon: Radio,
      isActive: pathname === "/beacons" || pathname?.startsWith("/beacons/"),
      items: [],
    },
    {
      title: "Geofences",
      url: "/geofences",
      icon: MapPin,
      isActive: pathname === "/geofences" || pathname?.startsWith("/geofences/"),
      items: [],
    },
    {
      title: "Sectors",
      url: "/sectors",
      icon: Building2,
      isActive: pathname === "/sectors" || pathname?.startsWith("/sectors/"),
      items: [],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

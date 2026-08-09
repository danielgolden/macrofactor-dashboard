"use client";

import * as React from "react";
import { UtensilsIcon } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { VIEWS, type ViewId } from "@/lib/views";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({
  view,
  onViewChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  view: ViewId;
  onViewChange: (view: ViewId) => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleViewChange = (id: ViewId) => {
    onViewChange(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <UtensilsIcon className="size-5!" />
              <span className="text-base font-semibold">MacroFactor Explorer</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {VIEWS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={view === item.id}
                    onClick={() => handleViewChange(item.id as ViewId)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

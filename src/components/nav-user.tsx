"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  EllipsisVerticalIcon,
  LogOutIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ onClearData }: { onClearData?: () => void }) {
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  if (!user) return null;

  const name = user.fullName ?? "User";
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleClearData = async () => {
    setClearing(true);
    setClearError(null);
    try {
      const res = await fetch("/api/data", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      setClearOpen(false);
      // Reload so the UI reflects the cleared state (foods, charts, etc.)
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setClearError(msg);
    } finally {
      setClearing(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.imageUrl} alt={name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-foreground/70">{email}</span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user.imageUrl} alt={name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setClearOpen(true)}
            >
              <Trash2Icon />
              Clear all data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/sign-in" })}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Confirmation dialog for clearing all data */}
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent showCloseButton={!clearing}>
          <DialogHeader>
            <DialogTitle>Clear all your data?</DialogTitle>
            <DialogDescription>
              This permanently deletes every imported food log entry and
              aggregated food for your account. This cannot be undone. You can
              always re-import your MacroFactor export afterwards.
            </DialogDescription>
          </DialogHeader>
          {clearError && (
            <p className="text-sm text-destructive">{clearError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearOpen(false)}
              disabled={clearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearData}
              disabled={clearing}
            >
              {clearing ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Clearing…
                </>
              ) : (
                "Delete everything"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  );
}

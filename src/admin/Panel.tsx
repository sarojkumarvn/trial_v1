import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Panel({
  title,
  description,
  onClose,
  origin,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  origin?: HTMLElement | null;
  children: ReactNode;
}) {
  const mobile = useIsMobile();
  return (
    <Drawer
      open
      direction={mobile ? "bottom" : "right"}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      autoFocus
    >
      <DrawerContent
        className="detail-panel"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          const target = origin?.isConnected
            ? origin
            : document.querySelector<HTMLElement>("[data-nav-focus]");
          target?.focus();
        }}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <Button
          size="icon"
          variant="ghost"
          className="panel-close"
          onClick={onClose}
          aria-label="Close details"
        >
          <X />
        </Button>
        <div className="panel-body">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
export function StatusPill({ value }: { value: string }) {
  return (
    <span className={"status-pill " + value.toLowerCase().replaceAll(" ", "-")}>
      <i />
      {value}
    </span>
  );
}

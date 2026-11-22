import {
  LayoutDashboard,
  FolderClosed,
  ClipboardCheck,
  ListTodo,
  UsersRound,
  Settings2,
  Plus,
  Layers3,
} from "lucide-react";
import { Brand } from "../Brand";
import { destinations, follow, root, useWorkspace } from "../admin/context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  useSidebar,
} from "./ui/sidebar";
import { Button } from "./ui/button";
const icons = [
  LayoutDashboard,
  FolderClosed,
  ClipboardCheck,
  ListTodo,
  UsersRound,
  Settings2,
];
export function AppSidebar({
  active,
  onNew,
}: {
  active: string;
  onNew: () => void;
}) {
  const { w } = useWorkspace(),
    { setOpenMobile } = useSidebar();
  const pending = w.plans.filter((p) => p.status === "Pending").length;
  const item = (i: number) => {
    const [slug, label] = destinations[i],
      Icon = icons[i],
      suffix = slug ? "/" + slug : "";
    return (
      <SidebarMenuItem key={slug}>
        <SidebarMenuButton asChild isActive={active === slug}>
          <a
            href={root + suffix}
            aria-current={active === slug ? "page" : undefined}
            onClick={(e) => follow(e, suffix, () => setOpenMobile(false))}
          >
            <Icon />
            {label}
            {i === 2 && <span className="count">{pending}</span>}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <a
          href={root}
          onClick={(e) => follow(e, "", () => setOpenMobile(false))}
        >
          <Brand />
        </a>
        <div className="workspace-id">
          <Layers3 size={18} />
          <strong>{w.name}</strong>
        </div>
        <Button
          onClick={() => {
            setOpenMobile(false);
            onNew();
          }}
        >
          <Plus />
          New project
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>{[0, 1, 2, 3].map(item)}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="secondary-nav">
          <SidebarMenu>{[4, 5].map(item)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="profile">
          <span className="avatar">AM</span>
          <div>
            <strong>{w.members[0].name}</strong>
            <small>Workspace admin</small>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

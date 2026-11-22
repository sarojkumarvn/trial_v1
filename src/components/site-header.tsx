import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="topbar">
      <SidebarTrigger />
      <Separator orientation="vertical" />
      <span className="breadcrumb">
        Workspace <span>/</span>
      </span>
      <strong>{title}</strong>
      <span
        className="demo"
        title="Changes are held in memory until you refresh."
      >
        <i />
        Demo workspace
      </span>
    </header>
  );
}

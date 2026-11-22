import {
  ClipboardCheck,
  UserRoundMinus,
  OctagonAlert,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { dueThisWeek } from "../admin/data";
import { useWorkspace, root, follow } from "../admin/context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
export function SectionCards() {
  const { w } = useWorkspace();
  const cards = [
    {
      label: "Plans awaiting approval",
      n: w.plans.filter((p) => p.status === "Pending").length,
      to: "/approvals",
      icon: ClipboardCheck,
      link: "Review plans",
      tone: "violet",
    },
    {
      label: "Unassigned tasks",
      n: w.tasks.filter((t) => !t.owner && t.status !== "Completed").length,
      to: "/tasks?owner=unassigned",
      icon: UserRoundMinus,
      link: "Assign owners",
      tone: "amber",
    },
    {
      label: "Blocked tasks",
      n: w.tasks.filter((t) => t.status === "Blocked").length,
      to: "/tasks?status=Blocked",
      icon: OctagonAlert,
      link: "Inspect blockers",
      tone: "coral",
    },
    {
      label: "Due this week",
      n: w.tasks.filter((t) => dueThisWeek(t, w.weekStart)).length,
      to: "/tasks?due=week",
      icon: CalendarDays,
      link: "View deadlines",
      tone: "mint",
    },
  ];
  return (
    <div className="metrics">
      {cards.map((c) => (
        <a key={c.label} href={root + c.to} onClick={(e) => follow(e, c.to)}>
          <Card>
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle>{c.n}</CardTitle>
              <span className={"metric-icon " + c.tone}>
                <c.icon size={17} />
              </span>
            </CardHeader>
            <CardFooter>
              {c.link}
              <ArrowUpRight size={13} />
            </CardFooter>
          </Card>
        </a>
      ))}
    </div>
  );
}

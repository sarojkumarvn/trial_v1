import { streams } from "../project";

export const statuses = [
  "To do",
  "In progress",
  "Blocked",
  "In testing",
  "Ready to ship",
  "Completed",
] as const;
export type Status = (typeof statuses)[number];
export const roles = ["Admin", "Manager", "Team Lead", "Team Member"] as const;
export type Role = (typeof roles)[number];
export type Member = { id: string; name: string; email: string; role: Role };
export type Invitation = Pick<Member, "id" | "email" | "role">;
export type Workstream = { name: string; lead: string };
export type Project = {
  id: string;
  name: string;
  lead: string;
  brief: string;
  target: string;
  milestones: { name: string; date: string }[];
};
export type Plan = {
  id: string;
  project: string;
  status: "Pending" | "Approved" | "Changes requested";
  reason: string;
  work: { stream: string; owner: string; deadline: string }[];
};
export type Task = {
  id: string;
  name: string;
  brief: string;
  project: string;
  stream: string;
  owner: string;
  status: Status;
  due: string;
  blocker: string;
  created: string;
  completed: string;
};
export type Workspace = {
  name: string;
  weekStart: string;
  projects: Project[];
  plans: Plan[];
  streams: Workstream[];
  tasks: Task[];
  members: Member[];
  invites: Invitation[];
};

export function day(offset = 0, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
export function dateLabel(s: string) {
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
export function dueThisWeek(task: Task, start: string, today = new Date()) {
  const offset = (today.getDay() + (start === "Monday" ? 6 : 0)) % 7;
  return (
    task.status !== "Completed" &&
    task.due >= day(-offset, today) &&
    task.due <= day(6 - offset, today)
  );
}
export function createProject(
  name: string,
  brief: string,
  lead: string,
  target: string,
): Project {
  return {
    id: crypto.randomUUID(),
    name,
    brief,
    lead,
    target,
    milestones: [{ name: "Delivery handoff", date: target }],
  };
}
export function draftPlan(project: Project, workstreams: Workstream[]): Plan {
  return {
    id: project.id,
    project: project.id,
    status: "Pending",
    reason: "",
    work: workstreams.map((s) => ({
      stream: s.name,
      owner: s.lead,
      deadline: project.target,
    })),
  };
}
export function demoWorkspace(): Workspace {
  const members: Member[] = [
    "Alex Morgan",
    ...streams.map((s) => s.lead),
    "Sam Chen",
    "Mia Patel",
  ].map((name, i) => ({
    id: "m" + i,
    name,
    email: name.toLowerCase().replace(" ", ".") + "@example.com",
    role: i === 0 ? "Admin" : i < 4 ? "Team Lead" : "Team Member",
  }));
  const workstreams = streams.map((s, i) => ({
    name: s.name,
    lead: members[i + 1].id,
  }));
  const projects = [
    [
      "Atlas Portal",
      "Build a self-service portal where clients can review project milestones and approve deliverables.",
    ],
    [
      "Relay API",
      "Unify partner integrations behind a versioned API with reliable event delivery.",
    ],
    [
      "Beacon Mobile",
      "Bring release tracking and account alerts to the mobile workspace.",
    ],
    [
      "Studio Refresh",
      "Update the design system and migrate the project intake experience.",
    ],
  ].map(([name, brief], i) => ({
    ...createProject(name, brief, members[(i % 3) + 1].id, day(12 + i * 4)),
    id: "p" + i,
    milestones: [
      {
        name: [
          "Client review",
          "Partner sandbox",
          "Beta rollout",
          "Design review",
        ][i],
        date: day(3 + i * 2),
      },
      { name: "Delivery handoff", date: day(12 + i * 4) },
    ],
  }));
  const plans = projects.map((p, i) => ({
    ...draftPlan(p, workstreams),
    status: i === 3 ? ("Approved" as const) : ("Pending" as const),
  }));
  const titles = [
    "Finalize onboarding screens",
    "Review webhook retries",
    "Audit session permissions",
    "Build project overview",
    "Validate event payloads",
    "Test device enrollment",
    "Resolve navigation states",
    "Publish API contract",
    "Verify access policies",
    "Polish empty states",
    "Backfill delivery events",
    "Review token expiry",
  ];
  const tasks: Task[] = titles.map((name, i) => ({
    id: "T-" + (101 + i),
    name,
    brief: [
      "Review the acceptance criteria with the project lead and deliver the updated client experience.",
      "Implement the integration and verify the response against partner fixtures.",
      "Review access boundaries and document the verification results.",
    ][i % 3],
    project: projects[i % 4].id,
    stream: workstreams[i % 3].name,
    owner: i % 4 === 0 ? "" : members[(i % 5) + 1].id,
    status: (
      [
        "In progress",
        "Blocked",
        "In testing",
        "Ready to ship",
        "To do",
        "In progress",
        "Blocked",
        "In testing",
      ] as Status[]
    )[i % 8],
    due: day(i - 3),
    blocker: "",
    created: day(-i % 8),
    completed: "",
  }));
  tasks.forEach((t) => {
    if (t.status === "Blocked")
      t.blocker =
        "Waiting for partner sign-off on the updated acceptance criteria.";
  });
  for (let i = 0; i < 90; i++) {
    const count = (i * 7 + Math.floor(i / 4) * 3) % 6;
    for (let j = 0; j < count; j++) {
      const template = tasks[(i + j) % titles.length];
      tasks.push({
        ...template,
        id: "T-" + (101 + tasks.length),
        name: template.name + " · iteration " + (i + 1) + "/" + (j + 1),
        owner: members[j + 1].id,
        status: "Completed",
        blocker: "",
        created: day(-i - j - 1),
        completed: day(-i),
        due: day(-i),
      });
    }
  }
  return {
    name: "Trial Studio",
    weekStart: "Monday",
    members,
    streams: workstreams,
    projects,
    plans,
    tasks,
    invites: [
      { id: "invite-1", email: "jules@example.com", role: "Team Member" },
    ],
  };
}

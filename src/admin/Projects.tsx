import { useState } from "react";
import { ArrowUpRight, FolderClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace, go } from "./context";
import { createProject, dateLabel, draftPlan, day } from "./data";
import { Panel, StatusPill } from "./Panel";

export function NewProject({
  close,
  origin,
}: {
  close: () => void;
  origin: HTMLElement | null;
}) {
  const { w, setW } = useWorkspace();
  const [error, setError] = useState("");
  return (
    <Panel
      title="New project"
      description="Start a project in this demo workspace."
      onClose={close}
      origin={origin}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fields = new FormData(e.currentTarget),
            read = (k: string) => String(fields.get(k) || "").trim();
          if (!read("name") || !read("brief")) {
            setError("Enter a project name and client brief.");
            return;
          }
          const project = createProject(
            read("name"),
            read("brief"),
            read("lead"),
            read("target"),
          );
          setW((old) => ({
            ...old,
            projects: [project, ...old.projects],
            plans: [draftPlan(project, old.streams), ...old.plans],
          }));
          close();
          go("/projects");
        }}
      >
        <label>
          Project name
          <input name="name" required maxLength={100} />
        </label>
        <label>
          Client brief
          <textarea name="brief" required />
        </label>
        <label>
          Lead
          <select name="lead" required defaultValue="">
            <option disabled value="">
              Select a lead
            </option>
            {w.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target date
          <input type="date" name="target" min={day()} required />
        </label>
        {error && <p role="alert">{error}</p>}
        <Button>Create project</Button>
      </form>
    </Panel>
  );
}
export function Projects({ approvals = false }: { approvals?: boolean }) {
  const { w, setW } = useWorkspace(),
    [id, setId] = useState(""),
    [origin, setOrigin] = useState<HTMLElement | null>(null),
    [request, setRequest] = useState(false),
    [reason, setReason] = useState("");
  const project = w.projects.find((p) => p.id === id),
    plan = w.plans.find((p) => p.project === id);
  const projects = w.projects.filter(
    (p) =>
      !approvals ||
      w.plans.some(
        (plan) => plan.project === p.id && plan.status === "Pending",
      ),
  );
  const member = (id: string) =>
    w.members.find((m) => m.id === id)?.name || "Unassigned";
  const resolve = (changes: boolean) => {
    setW((old) => ({
      ...old,
      plans: old.plans.map((p) =>
        p.project === id
          ? {
              ...p,
              status: changes ? "Changes requested" : "Approved",
              reason: changes ? reason.trim() : "",
            }
          : p,
      ),
    }));
    setId("");
  };
  return (
    <>
      <div className="record-list">
        {projects.map((p) => {
          const plan = w.plans.find((plan) => plan.project === p.id);
          const next = p.milestones
            .filter((m) => m.date >= day())
            .sort((a, b) => a.date.localeCompare(b.date))[0];
          return (
            <button
              key={p.id}
              onClick={(e) => {
                setOrigin(e.currentTarget);
                setId(p.id);
                setRequest(false);
                setReason("");
              }}
            >
              <span className="record-icon">
                <FolderClosed size={19} />
              </span>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {member(p.lead)} ·{" "}
                  {next
                    ? next.name + " on " + dateLabel(next.date)
                    : "No upcoming milestone"}
                </small>
              </div>
              <StatusPill
                value={
                  approvals
                    ? "Pending"
                    : plan?.status === "Approved"
                      ? "In delivery"
                      : plan?.status === "Changes requested"
                        ? "Revising plan"
                        : "Planning"
                }
              />
              <ArrowUpRight size={16} />
            </button>
          );
        })}
        {!projects.length && (
          <p className="empty">
            {approvals
              ? "No project plans awaiting approval."
              : "No projects yet."}
          </p>
        )}
      </div>
      {project && plan && (
        <Panel
          title={project.name}
          description={approvals ? "Plan review" : "Project details"}
          origin={origin}
          onClose={() => setId("")}
        >
          <StatusPill value={plan.status} />
          <section>
            <h3>Client brief</h3>
            <p>{project.brief}</p>
          </section>
          <section>
            <h3>Milestones</h3>
            {project.milestones.map((m) => (
              <p className="split" key={m.name}>
                {m.name}
                <span>{dateLabel(m.date)}</span>
              </p>
            ))}
          </section>
          <section>
            <h3>Workstreams</h3>
            {plan.work.map((s) => (
              <p className="split" key={s.stream}>
                <span>
                  {s.stream}
                  <small>{member(s.owner)}</small>
                </span>
                {dateLabel(s.deadline)}
              </p>
            ))}
          </section>
          {plan.reason && (
            <section>
              <h3>Requested changes</h3>
              <p>{plan.reason}</p>
            </section>
          )}
          {approvals &&
            (request ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reason.trim()) resolve(true);
                }}
              >
                <label>
                  Reason for changes
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <Button disabled={!reason.trim()}>Submit change request</Button>
              </form>
            ) : (
              <div className="actions">
                <Button onClick={() => resolve(false)}>Approve plan</Button>
                <Button variant="outline" onClick={() => setRequest(true)}>
                  Request changes
                </Button>
              </div>
            ))}
        </Panel>
      )}
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "./context";
import { roles, type Role } from "./data";
import { Panel } from "./Panel";
export function Team() {
  const { w, setW } = useWorkspace(),
    [action, setAction] = useState<{
      kind: "invite" | "remove" | "revoke" | "role";
      id: string;
      origin: HTMLElement;
      role?: Role;
    } | null>(null),
    [error, setError] = useState("");
  const target =
    w.members.find((m) => m.id === action?.id) ||
    w.invites.find((m) => m.id === action?.id);
  const changeRole = (id: string, role: Role) =>
    setW((old) => ({
      ...old,
      members: old.members.map((m) => (m.id === id ? { ...m, role } : m)),
    }));
  const confirm = () => {
    if (!action) return;
    if (action.kind === "role") changeRole(action.id, action.role!);
    else if (action.kind === "revoke")
      setW((old) => ({
        ...old,
        invites: old.invites.filter((i) => i.id !== action.id),
      }));
    else
      setW((old) => ({
        ...old,
        members: old.members.filter((m) => m.id !== action.id),
        tasks: old.tasks.map((t) =>
          t.owner === action.id ? { ...t, owner: "" } : t,
        ),
        projects: old.projects.map((p) =>
          p.lead === action.id ? { ...p, lead: "" } : p,
        ),
        streams: old.streams.map((s) =>
          s.lead === action.id ? { ...s, lead: "" } : s,
        ),
        plans: old.plans.map((p) => ({
          ...p,
          work: p.work.map((s) =>
            s.owner === action.id ? { ...s, owner: "" } : s,
          ),
        })),
      }));
    setAction(null);
  };
  return (
    <>
      <section className="surface">
        <div className="section-title">
          <h2>Members</h2>
          <Button
            size="sm"
            onClick={(e) => {
              setError("");
              setAction({ kind: "invite", id: "", origin: e.currentTarget });
            }}
          >
            Invite teammate
          </Button>
        </div>
        {w.members.map((m) => (
          <div className="team-row" key={m.id}>
            <div>
              <strong>{m.name}</strong>
              <small>{m.email}</small>
            </div>
            {m.id === "m0" ? (
              <span>{m.role} · You</span>
            ) : (
              <>
                <select
                  aria-label={"Role for " + m.name}
                  value={m.role}
                  onChange={(e) =>
                    setAction({
                      kind: "role",
                      role: e.target.value as Role,
                      id: m.id,
                      origin: e.currentTarget,
                    })
                  }
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) =>
                    setAction({
                      kind: "remove",
                      id: m.id,
                      origin: e.currentTarget,
                    })
                  }
                >
                  Remove access
                </Button>
              </>
            )}
          </div>
        ))}
      </section>
      <section className="surface">
        <h2>Pending invitations</h2>
        {w.invites.map((i) => (
          <div className="team-row" key={i.id}>
            <div>
              <strong>{i.email}</strong>
              <small>{i.role}</small>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) =>
                setAction({ kind: "revoke", id: i.id, origin: e.currentTarget })
              }
            >
              Revoke invitation
            </Button>
          </div>
        ))}
        {!w.invites.length && <p>No pending invitations.</p>}
      </section>
      {action && (
        <Panel
          title={
            {
              invite: "Invite teammate",
              remove: "Remove access?",
              revoke: "Revoke invitation?",
              role: "Change workspace role?",
            }[action.kind]
          }
          description="Applies to this demo session only."
          origin={action.origin}
          onClose={() => setAction(null)}
        >
          {action.kind === "invite" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  email = String(f.get("email")).trim().toLowerCase(),
                  role = f.get("role") as Role;
                if (
                  [...w.members, ...w.invites].some(
                    (m) => m.email.toLowerCase() === email,
                  )
                ) {
                  setError(
                    "This email is already a member or has a pending invitation.",
                  );
                  return;
                }
                const invite = { id: crypto.randomUUID(), email, role };
                setW((old) => ({ ...old, invites: [...old.invites, invite] }));
                setAction(null);
              }}
            >
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Role
                <select name="role" defaultValue="Team Member">
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <small>Demo invitations appear here without sending email.</small>
              {error && <p role="alert">{error}</p>}
              <Button>Add demo invitation</Button>
            </form>
          ) : (
            <>
              <p>
                {action.kind === "remove"
                  ? "Remove the workspace membership and clear assigned ownership for "
                  : action.kind === "role"
                    ? "Apply the " + action.role + " role to "
                    : "Remove the pending invitation for "}
                {target?.email}?
              </p>
              <div className="actions">
                <Button onClick={confirm}>
                  Confirm{" "}
                  {action.kind === "role"
                    ? "role change"
                    : action.kind === "remove"
                      ? "removal"
                      : "revocation"}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Panel>
      )}
    </>
  );
}
export function Settings() {
  const { w, setW } = useWorkspace(),
    [name, setName] = useState(w.name),
    [week, setWeek] = useState(w.weekStart),
    [saved, setSaved] = useState(false);
  const dirty = name !== w.name || week !== w.weekStart;
  return (
    <form
      className="surface settings"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setW((old) => ({ ...old, name: name.trim(), weekStart: week }));
        setName(name.trim());
        setSaved(true);
      }}
    >
      <h2>Workspace preferences</h2>
      <label>
        Workspace name
        <input
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Start of delivery week
        <select value={week} onChange={(e) => setWeek(e.target.value)}>
          <option>Monday</option>
          <option>Sunday</option>
        </select>
      </label>
      <p role="status">
        {!name.trim()
          ? "Enter a workspace name."
          : dirty
            ? "Unsaved changes"
            : saved
              ? "Applied to this demo session."
              : "Changes last until you refresh."}
      </p>
      <Button disabled={!dirty || !name.trim()}>Save preferences</Button>
    </form>
  );
}

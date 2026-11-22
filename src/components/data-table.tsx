import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Ellipsis,
  GripVertical,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useWorkspace, go } from "../admin/context";
import {
  dateLabel,
  day,
  dueThisWeek,
  statuses,
  type Task,
  type Status,
} from "../admin/data";
import { Panel, StatusPill } from "../admin/Panel";

const columns = ["Project", "Workstream", "Owner", "Status", "Due date"];
const views = ["All tasks", "Blocked", "In testing", "Ready to ship"];
function PriorityRow({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.72 : 1,
      }}
    >
      <TableCell>
        <button
          ref={setActivatorNodeRef}
          className="grip"
          {...attributes}
          {...listeners}
          aria-label={"Reorder " + id}
        >
          <GripVertical size={14} />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}
export function DataTable({ full = false }: { full?: boolean }) {
  const { w, setW } = useWorkspace(),
    query = new URLSearchParams(location.search);
  const [view, setView] = useState("All tasks"),
    [hidden, setHidden] = useState<string[]>([]),
    [selection, select] = useState<string[]>([]);
  const [page, setPage] = useState(0),
    [size, setSize] = useState(6),
    [opened, open] = useState(""),
    [bulk, setBulk] = useState(false);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);
  const member = (id: string) =>
    w.members.find((m) => m.id === id)?.name || "Unassigned";
  const project = (id: string) => w.projects.find((p) => p.id === id)?.name;
  const get = (key: string) => (full ? query.get(key) || "" : "");
  const filtered = w.tasks.filter((t) => {
    const owner = get("owner"),
      due = get("due");
    return (
      (full || view === "All tasks" || t.status === view) &&
      (!get("project") || t.project === get("project")) &&
      (!get("stream") || t.stream === get("stream")) &&
      (!get("status") || t.status === get("status")) &&
      (!owner ||
        (owner === "unassigned"
          ? !t.owner && t.status !== "Completed"
          : t.owner === owner)) &&
      (!due ||
        (due === "week"
          ? dueThisWeek(t, w.weekStart)
          : t.status !== "Completed" && t.due < day())) &&
      (!get("q") ||
        [t.name, t.id, project(t.project), t.brief]
          .join(" ")
          .toLowerCase()
          .includes(get("q").toLowerCase()))
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / size)),
    actual = Math.min(page, pages - 1);
  const rows = filtered.slice(actual * size, (actual + 1) * size);
  const selected = filtered
    .filter((t) => selection.includes(t.id))
    .map((t) => t.id);
  const editFilter = (key: string, value: string) => {
    if (value) query.set(key, value);
    else query.delete(key);
    go("/tasks" + (query.size ? "?" + query : ""));
    setPage(0);
    select([]);
  };
  const toggle = (id: string) =>
    select((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const move = (id: string, to: string) => {
    if (id === to || !to || !id) return;
    setW((old) => {
      const tasks = [...old.tasks],
        from = tasks.findIndex((t) => t.id === id),
        dest = tasks.findIndex((t) => t.id === to);
      if (from < 0 || dest < 0) return old;
      tasks.splice(dest, 0, ...tasks.splice(from, 1));
      return { ...old, tasks };
    });
  };
  const show = (id: string, el: HTMLElement | null) => {
    setOrigin(el);
    open(id);
  };
  const active = w.tasks.find((t) => t.id === opened);
  const update = (id: string, patch: Partial<Task>) =>
    setW((old) => ({
      ...old,
      tasks: old.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  const filterSelect = (key: string, label: string, items: string[][]) => (
    <label>
      {label}
      <select
        value={get(key)}
        onChange={(e) => editFilter(key, e.target.value)}
      >
        <option value="">All</option>
        {items.map(([v, l]) => (
          <option value={v} key={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="queue">
      {full && (
        <div className="filters">
          <label className="search">
            Search tasks
            <input
              type="search"
              value={get("q")}
              placeholder="Task name, ID or project"
              onChange={(e) => editFilter("q", e.target.value)}
            />
          </label>
          {filterSelect(
            "project",
            "Project",
            w.projects.map((p) => [p.id, p.name]),
          )}
          {filterSelect(
            "stream",
            "Workstream",
            w.streams.map((s) => [s.name, s.name]),
          )}
          {filterSelect("owner", "Owner", [
            ["unassigned", "Unassigned"],
            ...w.members.map((m) => [m.id, m.name]),
          ])}
          {filterSelect(
            "status",
            "Status",
            statuses.map((s) => [s, s]),
          )}
          {filterSelect("due", "Due date", [
            ["week", "This week"],
            ["overdue", "Overdue"],
          ])}
        </div>
      )}
      <div className="queue-heading">
        <h2>{full ? "Task list" : "Work queue"}</h2>
        <span>{filtered.length} tasks</span>
      </div>
      <div className="queue-tools">
        {!full && (
          <>
            <div className="views">
              {views.map((v) => (
                <button
                  aria-pressed={v === view}
                  key={v}
                  onClick={() => {
                    setView(v);
                    setPage(0);
                    select([]);
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <select
              className="compact-view"
              aria-label="Queue view"
              value={view}
              onChange={(e) => {
                setView(e.target.value);
                setPage(0);
                select([]);
              }}
            >
              {views.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </>
        )}
        {selected.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              setOrigin(e.currentTarget);
              setBulk(true);
            }}
          >
            Assign owner ({selected.length})
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="column-btn" variant="outline" size="sm">
              <Columns3 />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((c) => (
              <DropdownMenuCheckboxItem
                key={c}
                checked={!hidden.includes(c)}
                onCheckedChange={() =>
                  setHidden((h) =>
                    h.includes(c) ? h.filter((i) => i !== c) : [...h, c],
                  )
                }
              >
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="table-frame">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={({ active, over }) => {
            if (over) move(String(active.id), String(over.id));
          }}
        >
          <SortableContext
            items={rows.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead aria-label="Priority" />
                  <TableHead>
                    <input
                      type="checkbox"
                      aria-label="Select this page"
                      checked={
                        !!rows.length &&
                        rows.every((t) => selection.includes(t.id))
                      }
                      onChange={(e) =>
                        select(
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...selection,
                                  ...rows.map((t) => t.id),
                                ]),
                              ]
                            : selection.filter(
                                (id) => !rows.some((t) => t.id === id),
                              ),
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  {columns
                    .filter((c) => !hidden.includes(c))
                    .map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  <TableHead aria-label="Row actions" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t, i) => (
                  <PriorityRow id={t.id} key={t.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={"Select " + t.id}
                        checked={selection.includes(t.id)}
                        onChange={() => toggle(t.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="task-link"
                        onClick={(e) => show(t.id, e.currentTarget)}
                      >
                        {t.name}
                      </button>
                    </TableCell>
                    {[
                      project(t.project),
                      t.stream,
                      <span className={t.owner ? "owner" : "muted"}>
                        {t.owner && (
                          <i className={"owner-icon owner-" + t.owner}>
                            {member(t.owner)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </i>
                        )}
                        {member(t.owner)}
                      </span>,
                      <StatusPill value={t.status} />,
                      dateLabel(t.due),
                    ].map(
                      (v, index) =>
                        !hidden.includes(columns[index]) && (
                          <TableCell key={columns[index]}>{v}</TableCell>
                        ),
                    )}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            id={"actions-" + t.id}
                            aria-label={"Actions for " + t.id}
                            size="icon"
                            variant="ghost"
                          >
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              show(
                                t.id,
                                document.getElementById("actions-" + t.id),
                              )
                            }
                          >
                            Task details
                          </DropdownMenuItem>
                          {[-1, 1].map((offset) => (
                            <DropdownMenuItem
                              key={offset}
                              disabled={!filtered[actual * size + i + offset]}
                              onSelect={() =>
                                move(
                                  t.id,
                                  filtered[actual * size + i + offset]?.id,
                                )
                              }
                            >
                              {offset < 0 ? <ArrowUp /> : <ArrowDown />}Move{" "}
                              {offset < 0 ? "up" : "down"}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </PriorityRow>
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
        {!rows.length && (
          <div className="empty">
            {w.tasks.length
              ? "No tasks match this view."
              : "No tasks in this workspace."}
            {full && query.size > 0 && (
              <Button variant="link" onClick={() => go("/tasks")}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="paging">
        <span>{selected.length} selected</span>
        <label>
          Rows{" "}
          <select
            value={size}
            onChange={(e) => {
              setSize(+e.target.value);
              setPage(0);
            }}
          >
            {[6, 12, 24].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <span>
          {actual + 1} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={!actual}
          onClick={() => setPage(actual - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={actual === pages - 1}
          onClick={() => setPage(actual + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      {active && (
        <Panel
          title={active.name}
          description={
            active.id + " · " + project(active.project) + " · " + active.stream
          }
          origin={origin}
          onClose={() => open("")}
        >
          <p>{active.brief}</p>
          <p>Due {dateLabel(active.due)}</p>
          <label>
            Owner
            <select
              value={active.owner}
              onChange={(e) => update(active.id, { owner: e.target.value })}
            >
              <option value="">Unassigned</option>
              {w.members.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={active.status}
              onChange={(e) =>
                update(active.id, {
                  status: e.target.value as Status,
                  completed: e.target.value === "Completed" ? day() : "",
                  blocker: e.target.value === "Blocked" ? active.blocker : "",
                })
              }
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {active.status === "Blocked" && (
            <label>
              Blocker reason
              <textarea
                value={active.blocker}
                placeholder="Describe the blocker"
                onChange={(e) => update(active.id, { blocker: e.target.value })}
              />
            </label>
          )}
          <small>Changes apply to this demo session.</small>
        </Panel>
      )}
      {bulk && (
        <Panel
          title="Assign owner"
          description={selected.length + " selected tasks"}
          origin={origin}
          onClose={() => setBulk(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const owner = String(new FormData(e.currentTarget).get("owner"));
              setW((old) => ({
                ...old,
                tasks: old.tasks.map((t) =>
                  selected.includes(t.id) ? { ...t, owner } : t,
                ),
              }));
              setBulk(false);
              select([]);
            }}
          >
            <label>
              Owner
              <select name="owner" required defaultValue="">
                <option value="" disabled>
                  Select a teammate
                </option>
                {w.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <Button>Apply assignment</Button>
          </form>
        </Panel>
      )}
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "./Icon";
import { streams } from "./project";

const stages = [
  "Brief uploaded",
  "Manager assigned",
  "Plan drafted and approved",
  "Work delegated",
  "Blocker raised",
  "Testing complete",
];
const views = [
  "Client brief",
  "Manager assignment",
  "Delivery plan",
  "Team queue",
  "My Work",
  "Release checklist",
];
const actors = [
  "Admin",
  "Admin",
  "Manager",
  "Team Lead",
  "Team Member",
  "Manager",
];
const short = ["Brief", "Manager", "Plan", "Delegate", "Blocker", "Testing"];
const times = [6000, 6000, 13000, 7500, 7500, 6500];
const milestone = (step: number) => (step === 2 ? 0.64 : 0.48);
export function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span className={"badge " + tone}>
      <i />
      {children}
    </span>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <i className="brandmark" aria-hidden="true">
        <b />
        <b />
        <b />
      </i>
      Trial
    </span>
  );
}
function SideItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className={"sideitem " + (active ? "chosen" : "")}>
      <Icon name={icon} />
      {label}
    </div>
  );
}
export default function Walkthrough() {
  const reduce = useReducedMotion(),
    ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false),
    [playing, setPlaying] = useState(!reduce),
    [step, setStep] = useState(-1),
    [ms, setMs] = useState(0);
  const [leads, setLeads] = useState(streams.map((s) => s.lead)),
    [dates, setDates] = useState(["2026-06-20", "2026-06-27"]);
  const total = times[step] ?? 6500,
    late = ms >= total * milestone(step),
    done = step === 5 && ms >= total,
    overview = step < 0;
  const valid =
    leads.every((l) => l.trim()) && !!dates[0] && dates[1] >= dates[0];
  const date = (i: number) =>
    new Date(dates[i] + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  function select(i: number) {
    setStep(i);
    setMs(0);
    setPlaying(false);
  }
  function advance() {
    setMs(total * milestone(step));
  }
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      threshold: 0.08,
    });
    ob.observe(ref.current!);
    return () => ob.disconnect();
  }, []);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { if (preference.matches) setPlaying(false) };
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!visible || !playing) return;
    const timer = setTimeout(() => {
      if (ms + 250 < total) setMs(ms + 250);
      else if (step === 5) {setMs(total);setPlaying(false)}
      else {setStep(step+1);setMs(0)}
    },250)
    return () => clearTimeout(timer)
  },[visible,playing,step,ms,total])
  const heading = overview
    ? "Project overview"
    : step === 2 && late
      ? "Approved delivery plan"
      : step === 3 && late
        ? "My Work"
        : views[step];
  const notices = overview
    ? [
        "Jamie reviewed the delivery plan",
        "Frontend lead updated the booking calendar",
        "Testing deadline confirmed",
      ]
    : [
        ["Client brief uploaded", "Phase deadlines recorded"],
        ["Jamie Lane assigned as manager", "Brief shared with Jamie"],
        late
          ? [
              "Jamie approved the delivery plan",
              "Workstreams published",
              ...leads.map((l) => l + " notified"),
            ]
          : ["AI draft prepared", "Manager approval pending"],
        late
          ? ["Booking calendar assigned to Sam Lee", "Task added to My Work"]
          : [
              "Frontend queue received by " + leads[0],
              "Booking calendar ready to delegate",
            ],
        late
          ? [
              "Sam raised “Missing slot API”",
              "Lead queue updated · Missing slot API",
              "Manager overview · At risk",
            ]
          : [
              "Sam opened the booking calendar",
              "Calendar implementation at 80%",
            ],
        late
          ? [
              "Regression tests passed",
              "Jamie accepted the release",
              "Clinic Booking App delivered",
            ]
          : ["Slot API blocker resolved", "Release verification in progress"],
      ][step];
  return (
    <div
      id="workflow"
      className="dashboard"
      ref={ref}
      aria-label="Trial interactive product preview"
    >
      <aside className="sidebar">
        <Brand />
        <div className="sidesection">
          <SideItem icon="pulse" label="Activity" />
          <SideItem icon="brief" label="Inbox" />
          <SideItem icon="check" label="My Work" />
        </div>
        <small>Workspace</small>
        <SideItem icon="layers" label="Projects" />
        <SideItem icon="person" label="Team members" />
        <small>Projects</small>
        <SideItem icon="folder" label="Clinic Booking App" active />
        <small>Workstreams</small>
        {streams.map((x) => (
          <SideItem key={x.name} icon={x.icon} label={x.name} />
        ))}
      </aside>
      <div className="deskbody">
        <div className="chrome">
          <span>
            <Icon name="folder" /> Projects <i>/</i> Clinic Booking App
          </span>
          <button
            onClick={() => {
              if (done) {
                setStep(0);
                setMs(0);
              }
              setPlaying(!playing);
            }}
            disabled={step === 2 && !valid}
          >
            {done ? "↻ Replay" : playing ? "Ⅱ Pause" : "▷ Play"}
          </button>
        </div>
        <div className="stagebar" aria-label="Workflow stages">
          {["Overview", ...short].map((v, n) => (
            <button
              key={v}
              aria-label={n ? stages[n - 1] : v}
              aria-current={step === n - 1 ? "step" : undefined}
              onClick={() => select(n - 1)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="deskgrid">
          <div className="deskmain">
            <div className="subtle">
              <i className="project-dot" /> CB–024 <i>/</i>{" "}
              {overview ? "Projects" : actors[step]}
            </div>
            <h2>Clinic Booking App</h2>
            <div className="viewlabel">{heading}</div>
            <motion.div
              key={step}
              initial={{ opacity: reduce ? 1 : 0.75 }}
              animate={{ opacity: 1 }}
            >
              {overview ? (
                <>
                  <div className="metadata">
                    {[
                      ["person", "Manager", "Jamie Lane"],
                      ["calendar", "Development", date(0)],
                      ["calendar", "Testing", date(1)],
                    ].map(([ic, k, v]) => (
                      <div key={k}>
                        <Icon name={ic} />
                        {k}
                        <strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                  <h4>Workstreams</h4>
                  <div className="table">
                    {streams.map((x, i) => (
                      <div key={x.name}>
                        <Icon name={x.icon} />
                        <strong>{x.name}</strong>
                        <span>{leads[i]}</span>
                        <Badge tone={["green", "violet", "amber"][i]}>
                          {["On track", "In progress", "In review"][i]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : step === 2 ? (
                <>
                  <Badge tone={late ? "green" : "amber"}>
                    {late
                      ? "Approved by Jamie Lane"
                      : "AI draft · Pending approval"}
                  </Badge>
                  <h4>Team assignments</h4>
                  {streams.map((x, i) => (
                    <label className="editrow" key={x.name}>
                      <Icon name={x.icon} />
                      {x.name}
                      <input
                        aria-label={x.name + " lead"}
                        disabled={late}
                        value={leads[i]}
                        onFocus={() => setPlaying(false)}
                        onChange={(e) =>
                          setLeads(
                            leads.map((l, j) => (i === j ? e.target.value : l)),
                          )
                        }
                      />
                    </label>
                  ))}
                  {dates.map((d, i) => (
                    <label className="editrow" key={i}>
                      {i ? "Testing deadline" : "Development deadline"}
                      <input
                        type="date"
                        disabled={late}
                        value={d}
                        onFocus={() => setPlaying(false)}
                        onChange={(e) =>
                          setDates(
                            dates.map((v, j) => (i === j ? e.target.value : v)),
                          )
                        }
                      />
                    </label>
                  ))}
                  {!late && (
                    <button disabled={!valid} onClick={advance}>
                      Approve plan
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="doc">
                    <Icon
                      name={
                        ["brief", "person", "layers", "grid", "pulse", "check"][
                          step
                        ]
                      }
                    />
                    <b>
                      {
                        [
                          "Clinic Booking App.pdf",
                          "Jamie Lane",
                          "",
                          "Booking calendar",
                          "Missing slot API",
                          "Release verification",
                        ][step]
                      }
                    </b>
                    <p>
                      {
                        [
                          "Client requirements for finding a clinician, reserving a slot, and confirming a booking.",
                          "Assigned project manager · Client brief and phase deadlines received.",
                          "",
                          late
                            ? "Assigned to Sam Lee in My Work."
                            : "Ready for " + leads[0] + " to delegate.",
                          late
                            ? "Sam reported the missing availability endpoint. The booking calendar is blocked."
                            : "Sam is integrating the calendar with appointment availability.",
                          late
                            ? "Testing complete. The project has been delivered."
                            : "Booking flow and availability checks passed. Final acceptance is pending.",
                        ][step]
                      }
                    </p>
                  </div>
                  <div className="editrow">
                    Development deadline <strong>{date(0)}</strong>
                  </div>
                  <div className="editrow">
                    Testing deadline <strong>{date(1)}</strong>
                  </div>
                  {step >= 3 && !late && (
                    <button onClick={advance}>
                      {
                        ["Assign to Sam", "Raise blocker", "Complete testing"][
                          step - 3
                        ]
                      }
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </div>
          <aside className="inspector">
            <div className="panelhead">
              <Icon name="layers" />{" "}
              {overview ? "Manager’s plan review" : heading}
              <span>···</span>
            </div>
            <div className="inspectcontent">
              <small>{overview ? "Project manager" : actors[step]}</small>
              <h3>{overview ? "Delivery plan review" : stages[step]}</h3>
              <Badge tone={step === 4 && late ? "amber" : "violet"}>
                {overview
                  ? "Reviewed"
                  : step === 2 && !late
                    ? "Pending approval"
                    : step === 5 && late
                      ? "Delivered"
                      : heading}
              </Badge>
              <h4>Recent activity</h4>
              {notices.map((v) => (
                <div className="event" key={v}>
                  <i />
                  {v}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

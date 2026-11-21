import Walkthrough, { Brand } from "./Walkthrough";
import { Icon } from "./Icon";
import { Illustration, Planning } from "./Visuals";
import "./App.css";
import Intake from "./Intake";
import Delivery from "./Delivery";

const links = ["Product", "Intake", "Planning", "Delivery"];
const pillars = [
  ["Project intake", "Capture the brief, deadlines, and owner in one place."],
  [
    "AI-assisted planning",
    "Review proposed teams and phase dates before work begins.",
  ],
  [
    "Delivery visibility",
    "Follow tasks, blockers, and testing through to release.",
  ],
];
const features = [
  [
    "planning",
    "Planning and monitoring",
    "Build a plan manually or review an AI draft. Approve team assignments and deadlines, then track the estimated finish.",
    <Planning />,
  ],
] as const;
export default function App() {
  return (
    <>
      <header>
        <nav className="rail">
          <a href="#top" aria-label="Trial home">
            <Brand />
          </a>
          <div className="navlinks">
            {links.map((l) => (
              <a key={l} href={"#" + l.toLowerCase()}>
                {l}
              </a>
            ))}
          </div>
          <a className="pill light" href="#workflow">
            See workflow
          </a>
        </nav>
      </header>
      <main id="top">
        <section className="hero">
          <div className="rail herocopy">
            <h1>
              Turn client briefs into work
              <br /> your teams can ship.
            </h1>
            <div className="summary">
              <p>
                Break projects into workstreams, assign the right teams, and see
                what’s on track from kickoff through testing.
              </p>
              <a href="#workflow">
                See workflow <Icon name="arrow" />
              </a>
            </div>
          </div>
          <Walkthrough />
        </section>
        <div className="roles rail">
          {["Admin", "Manager", "Team Lead", "Team Member"].map((r, i) => (
            <span key={r}>
              <Icon name={["shield", "layers", "grid", "person"][i]} />
              {r}
            </span>
          ))}
        </div>
        <section id="product" className="rail product">
          <h2>
            <strong>One workspace for project delivery.</strong> Turn a client
            brief into a plan, give every team clear ownership, and see where
            work needs attention.
          </h2>
          <div className="pillars">
            {pillars.map(([name, copy], i) => (
              <article key={name}>
                <small>FIG 0.{i + 1}</small>
                <Illustration kind={i} />
                <h3>{name}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <Intake />
        {features.map(([id, title, copy, art]) => (
          <section className="rail feature" id={id} key={id}>
            <div className="featurehead">
              <h2>{title}</h2>
              <div>
                <p>{copy}</p>
                <a href="#workflow">
                  See workflow <Icon name="arrow" />
                </a>
              </div>
            </div>
            {art}
          </section>
        ))}
        <Delivery />
        <section className="closing">
          <h2>
            Give every team a clear
            <br /> path to delivery.
          </h2>
          <div>
            <a className="pill light" href="#workflow">
              See workflow
            </a>
            <a className="pill" href="#top">
              Back to top
            </a>
          </div>
        </section>
      </main>
      <footer>
        <div className="rail">
          <a href="#top" aria-label="Trial home">
            <Brand />
          </a>
          {[
            ["Product", ["Product", "Intake", "Planning", "Delivery"]],
            ["Workspace", ["Project overview", "Workflow preview"]],
            ["Navigation", ["Back to top"]],
          ].map(([title, items]) => (
            <div key={String(title)}>
              <h4>{title}</h4>
              {(items as string[]).map((n) => (
                <a
                  key={n}
                  href={
                    "#" +
                    (links.includes(n)
                      ? n.toLowerCase()
                      : n === "Back to top"
                        ? "top"
                        : "workflow")
                  }
                >
                  {n}
                </a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </>
  );
}

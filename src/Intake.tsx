import { useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import channel from "./assets/intake/channel.png";
import andreas from "./assets/intake/andreas.png";
import karri from "./assets/intake/karri.png";
import linear from "./assets/intake/linear.png";
import "./Intake.css";

type Reply = { id: number; message: string; time: string };
type Card = { id: string; title: string; labels: string[]; fresh?: boolean };

const columns = [
  { name: "Backlog", count: 28, cards: [
    ["ENG-2084", "Improve route recommendations", "API"],
    ["ENG-2082", "Investigate performance across streams", "Performance"],
    ["ENG-2079", "Review timing of vehicle sync", "Analytics"],
    ["ENG-2078", "Simplify request routing", "API"],
  ] },
  { name: "Todo", count: 73, cards: [
    ["ENG-2704", "Track iOS startup performance", "Analytics"],
    ["ENG-2703", "Faster app launch", "Performance"],
    ["ENG-926", "Remove UI inconsistencies", "Bug", "Design"],
    ["ENG-2088", "TypeError: Cannot read properties", "Bug"],
  ] },
  { name: "In Progress", count: 3, cards: [
    ["ENG-1487", "Remove contentData from GraphQL API", "61039"],
    ["MKT-1028", "Launch page assets", "Design"],
    ["ENG-2187", "Prevent duplicate ride requests on poor networks", "Bug", "62048"],
  ] },
  { name: "Done", count: 36, cards: [
    ["ENG-2074", "Clean up deprecated APIs", "API"],
    ["ENG-1912", "Reduce latency", "61023"],
    ["ENG-1951", "Reduce ETA jitter", "61021"],
    ["ENG-1980", "Improve fallback handling", "UI"],
  ] },
];

function IssueCard({ card }: { card: Card }) {
  return (
    <article className={`intake-card${card.fresh ? " fresh-card" : ""}`}>
      <div>{card.id}<img src={karri} alt="" /></div>
      <strong title={card.title}>{card.title}</strong>
      <div className="intake-labels">
        <span aria-hidden="true">{card.labels.includes("Analytics") || card.labels.includes("Performance") ? "!" : "▥"}</span>
        {card.labels.map(label => <span key={label}><i data-label={label} />{label}</span>)}
      </div>
    </article>
  );
}

function IntakeBoard({ replies }: { replies: Reply[] }) {
  return (
    <div className="intake-board" role="region" aria-label="Project board" tabIndex={0}>
      {columns.map(({ name, count, cards }) => {
        const todo = name === "Todo";
        const newCards: Card[] = todo ? replies.map(reply => ({
          id: `ENG-${reply.id}`, title: reply.message.trimStart().split("\n")[0].trim(),
          labels: ["Product"], fresh: true,
        })).reverse() : [];
        return (
          <section key={name} className="intake-column" aria-label={name}>
            <div className="intake-column-head">
              <i />{name}<span>{count + newCards.length}</span><b aria-hidden="true">+&emsp;···</b>
            </div>
            {[...newCards, ...cards.map(([id, title, ...labels]) => ({ id, title, labels }))].map(card =>
              <IssueCard card={card} key={card.id} />
            )}
          </section>
        );
      })}
    </div>
  );
}

function Message({ name, avatar, time = "8:53 PM", children }: {
  name: string; avatar?: string; time?: string; children: ReactNode;
}) {
  return (
    <div className={`intake-message${avatar ? "" : " fresh-reply"}`}>
      {avatar ? <img src={avatar} alt="" /> : <span className="visitor-avatar">Y</span>}
      <div>
        <div className="intake-byline"><b>{name}</b>{name === "Linear" && <small>APP</small>}<time>{time}</time></div>
        {children}
      </div>
    </div>
  );
}

export default function Intake() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [draft, setDraft] = useState("");
  const history = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (history.current) history.current.scrollTop = history.current.scrollHeight;
  }, [replies]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setReplies(previous => [...previous, { id: 2705 + previous.length, message: draft, time }]);
    setDraft("");
    input.current?.focus({ preventScroll: true });
  }

  return (
    <section className="rail feature intake-section" id="intake">
      <div className="featurehead">
        <h2>Intake<br />and integrations</h2>
        <div><p>Automatically turn conversations and customer feedback into actionable issues that are instantly routed, labeled, and prioritized for the right team.</p>
          <a href="#workflow">Learn more <Icon name="arrow" /></a>
        </div>
      </div>
      <div className="intake-preview">
        <IntakeBoard replies={replies} />
        <section className="intake-thread" aria-label="Product thread">
          <div className="intake-thread-head"><img src={channel} alt="" /><b>Thread</b><small>#product</small><span aria-hidden="true">⋮</span></div>
          <div className="intake-history" ref={history} role="log" aria-label="Thread messages" tabIndex={0}>
            <Message name="karri" avatar={karri}><p>Looks like we wait for the vehicle_state sync every time...</p></Message>
            <Message name="andreas" avatar={andreas}><p>Feels like we could render sooner and load the rest in the background. Probably also worth tracking startup timing so we know how often this happens!</p></Message>
            <Message name="karri" avatar={karri}><p><em>@Linear</em> create issues and assign to me</p></Message>
            <Message name="Linear" avatar={linear}><p>Created 2 issues:</p>
              <ul><li><em>ENG-2703</em> Faster app launch</li><li><em>ENG-2704</em> Track iOS startup performance</li></ul>
            </Message>
            {replies.map(reply => <Message key={reply.id} name="You" time={reply.time}><p>{reply.message}</p></Message>)}
          </div>
          <form onSubmit={send} className="intake-composer">
            <textarea aria-label="Reply to thread" placeholder="Reply..." ref={input} value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }} />
            <div className="intake-composer-tools"><span aria-hidden="true">＋&emsp; Aa&emsp; ☺&emsp; @&emsp;│&emsp; ▫&emsp; ♧</span>
              <button type="submit" aria-label="Send reply" disabled={!draft.trim()}><Icon name="arrow" /></button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

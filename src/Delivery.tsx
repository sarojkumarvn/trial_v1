import { useRef } from "react";
import { useInView } from "framer-motion";
import { Icon } from "./Icon";
import "./Delivery.css";

const groups = [
  { name: "In Review", status: "in-review", issues: [
    [2498, "Replace isFullySynced with a sync status"],
    [2380, "Show a stale data banner while syncing"],
    [2039, "Pass sync status to the dashboard"],
  ] },
  { name: "In Progress", status: "in-progress", issues: [
    [2076, "Reduce ETA jitter"],
    [2108, "Handle GPS dropouts gracefully"],
    [2143, "Optimize map tile loading on initial app open"],
    [2187, "Prevent duplicate ride requests on poor networks"],
  ] },
  { name: "Todo", status: "todo", issues: [
    [2254, "Reduce unnecessary map re-rendering on home screen"],
    [2291, "Clean up deprecated APIs used by the rider"],
    [2327, "Speed up CI pipelines for mobile builds"],
    [2358, "Reduce flakiness in mobile UI tests"],
  ] },
] as const;

function IssueList() {
  return (
    <div className="delivery-list">
      {groups.map(({ name, status, issues }) => (
        <div className={status} key={name}>
          <div className="issue-group"><span aria-hidden="true">▾</span><i />{name}<small>{issues.length}</small></div>
          {issues.map(([id, title], index) => (
            <div className="delivery-issue" key={id}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                {index === issues.length - 1 && status !== "todo"
                  ? <path d="M0 7h3m2 0h3m2 0h3" stroke="currentColor" strokeWidth="2" />
                  : <path d="M0 13V7h3v6zm5 0V4h3v9zm5 0V1h3v12z" fill="currentColor" />}
              </svg>
              <span>ENG-{id}</span><i />{title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Paired entries keep each replacement on the same numbered row as its deletion.
const lines = [
  "import React from 'react'",
  "import { View, ActivityIndicator } from 'react-native'",
  ["import { useVehicleState } from '@hooks/useVehicleState'", "import { useVehicleState, SyncStatus } from '@hooks/useVehicleState'"],
  "import { Dashboard } from '@components/Dashboard'",
  "",
  "export const HomeScreen = () => {",
  ["  const { vehicleState, isFullySynced } = useVehicleState()", "  const { vehicleState, syncStatus } = useVehicleState()"],
  "",
  ["  if (!isFullySynced) {", "  if (syncStatus === SyncStatus.Loading) {"],
  '    return <ActivityIndicator size="large" />',
  "  }",
  "",
  "  return (",
  "    <View>",
  ["      <Dashboard state={vehicleState} />", "      <Dashboard state={vehicleState} syncStatus={syncStatus} />"],
  "    </View>",
  "  )",
  "}",
] as const;

function highlight(line: string) {
  return line.split(/('[^']*'|"[^"]*"|\b\w+\b|=>|===|=)/).map((token, index) => {
    let color;
    if (/^(import|from|export|const|return|if|=>|===|=)$/.test(token)) color = "keyword";
    else if (/^['"]/.test(token)) color = "string";
    else if (/^(HomeScreen|size|state)$/.test(token) || (token === "useVehicleState" && line.includes("()"))) color = "function";
    else if (/^(isFullySynced|syncStatus)$/.test(token)) color = "edit";
    else if (/^\w/.test(token)) color = line.trimStart().startsWith("<") || line.includes("return <") ? "tag" : "identifier";
    return color ? <span className={`syntax-${color}`} key={index}>{token}</span> : token;
  });
}

export default function Delivery() {
  const preview = useRef<HTMLDivElement>(null);
  const seen = useInView(preview, { once: true, amount: 0.15 });
  return (
    <section className="rail feature delivery-section" id="delivery">
      <div className="featurehead">
        <h2>Build, review,<br />and ship</h2>
        <div>
          <p>Streamline code reviews with clear diffs, better context, and fewer back-and-forth comments. Keep PRs moving without sacrificing quality.</p>
          <a href="#workflow">Learn more <Icon name="arrow" /></a>
        </div>
      </div>
      <div className="delivery-preview" ref={preview}>
        <IssueList />
        <div className="delivery-diff">
          <div className="diff-toolbar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M3 2h6l4 4v8H3zM8.5 2v4.5H13" />
            </svg>
            <code>kinetic-ios/src/screens/Home/HomeScreen.tsx</code>
            <span>Linear <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m2 5 3-3 3 3m-6 2 3 3 3-3" /></svg></span>
          </div>
          <div className="diff-scroll" role="region" aria-label="HomeScreen code diff" tabIndex={0}>
            <div className="diff-columns">
              {(["deletion", "addition"] as const).map((side, pane) => (
                <div className={side} key={side} aria-label={side === "deletion" ? "Before" : "After"}>
                  {lines.map((entry, index) => (
                    <div key={index} className={`code-line${typeof entry !== "string" ? " changed" : ""}${index === 6 && seen ? " review-pulse" : ""}`}>
                      <span className="line-number">{String(index + 1).padStart(2, "0")}</span>
                      <code>{highlight(typeof entry === "string" ? entry : entry[pane])}</code>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

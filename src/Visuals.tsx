import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Icon } from "./Icon";
import { streams } from "./project";
import { Badge } from "./Walkthrough";

const pillarContours = [
  "M50 94 l105 -52.5 105 52.5 -105 52.5 z", // Top sheet rim
  "M103 161 l48 -24 48 24", // Front block
  "M176 73 l84 42 v84", // Tallest upright panel
];

export function Illustration({ kind }: { kind: number }) {
  const drawing = useRef<SVGSVGElement>(null);
  const inView = useInView(drawing, { once: true, amount: 0.25 });
  const sheet = (x: number, y: number, w: number, h: number) => (
    <path
      key={x + "," + y}
      d={`M${x} ${y} l${w} ${-w / 2} ${w} ${w / 2} v${h} l${-w} ${w / 2} ${-w} ${-w / 2}z m0 0 l${w} ${w / 2} ${w} ${-w / 2} m${-w} ${w / 2} v${h}`}
    />
  );
  return (
    <svg ref={drawing} className="drawing" viewBox="0 0 310 275" aria-hidden="true">
      <g>
        {kind === 0 ? (
          <>
            {[0, 1, 2, 3, 4].map((_, i) => sheet(50, 162 - i * 17, 105, 10))}
            <path d="m133 97 26-13 31 16-26 13z m-10 10 29 15m-18-8 15-7" />
          </>
        ) : kind === 1 ? (
          <>
            {sheet(104, 55, 48, 69)}
            {sheet(45, 101, 48, 69)}
            {sheet(160, 105, 48, 69)}
            {sheet(103, 161, 48, 36)}
          </>
        ) : (
          Array.from({ length: 12 }, (_, i) =>
            sheet(45 + i * 10, 196 - i * 3, 45, 4 - i * 0.1),
          ).reverse()
        )}
      </g>
      {kind === 2 && (
        <g>
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${80 + i * 12} ${189 - i * 4}v-${12 + i * 9}l84 42v${12 + i * 9}z`}
            />
          )).reverse()}
        </g>
      )}
      {inView && (
        <path
          className="pillar-trace"
          d={pillarContours[kind]}
          pathLength="100"
          strokeDasharray="14 100"
          strokeDashoffset="14"
          style={{ animationDelay: `${kind * 250}ms` }}
        />
      )}
    </svg>
  );
}
function PanelTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="panelhead">
      <Icon name={icon} />
      {title}
      <span>···</span>
    </div>
  );
}
export function Planning() {
  const reduced = useReducedMotion();
  return (
    <div className="visual plan-art">
      <div className="roadmap backdrop">
        <PanelTitle icon="calendar" title="Workstream roadmap" />
        <div className="months">
          MAY <span>JUNE</span> JULY
        </div>
        {streams.map((s, i) => (
          <div
            key={s.name}
            className="road"
            style={{ marginLeft: 6 + i * 7 + "%" }}
          >
            <b>
              <Icon name={s.icon} /> {s.name}
            </b>
            <i />
            <small>
              {s.lead} · {s.date}
            </small>
          </div>
        ))}
      </div>
      <div className="floating analytics">
        <PanelTitle icon="pulse" title="Estimated finish by workstream" />
        <div className="panelpad">
          <small>Testing deadline</small>
          <h3>
            June 27 <Badge>On track</Badge>
          </h3>
          <motion.svg
            viewBox="0 0 520 260"
            role="img"
            aria-label="Projected finish dates cluster around June 14 for Frontend, June 18 for Backend, and June 20 for Security"
            initial={{ opacity: reduced ? 1 : 0.4 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[35, 80, 125, 170, 215].map((y) => (
              <line key={y} x1="0" x2="520" y1={y} y2={y} />
            ))}
            {[0, 1, 2].map((n) => (
              <g key={n}>
                {Array.from({ length: 68 }, (_, i) => (
                  <circle
                    key={i}
                    cx={
                      80 +
                      n * 176 +
                      Math.sin(i * 31 + n) * Math.cos(i * 2.3) * 19
                    }
                    cy={
                      161 - n * 32 + Math.sin(i * 5.7) * Math.cos(i * 0.8) * 57
                    }
                    r="2.3"
                  />
                ))}
              </g>
            ))}
            <path d="M0 165H95L140 147H225L253 120H352L391 99H520" />
          </motion.svg>
          <div className="chartlabels">
            {streams.map((s) => (
              <span key={s.name}>
                {s.name} · {s.date}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

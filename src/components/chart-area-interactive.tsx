import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useWorkspace } from "../admin/context";
import { dateLabel, day } from "../admin/data";
const config = {
  created: { label: "Tasks created", color: "#74cbb6" },
  completed: { label: "Tasks completed", color: "#9492d3" },
};
export default function ChartAreaInteractive() {
  const [range, setRange] = useState("30"),
    { w } = useWorkspace();
  const data = Array.from({ length: Number(range) }, (_, i) => ({
    date: day(1 + i - Number(range)),
    created: 0,
    completed: 0,
  }));
  const days = new Map(data.map((d) => [d.date, d]));
  for (const t of w.tasks) {
    const created = days.get(t.created),
      completed = days.get(t.completed);
    if (created) created.created++;
    if (completed) completed.completed++;
  }
  return (
    <Card className="activity">
      <CardHeader>
        <CardTitle>Delivery activity</CardTitle>
        <div className="legend">
          <span>Tasks created</span>
          <span>Tasks completed</span>
        </div>
        <CardAction>
          <ToggleGroup
            className="range-buttons"
            type="single"
            aria-label="Activity range"
            value={range}
            onValueChange={(v) => v && setRange(v)}
          >
            {["7", "30", "90"].map((n) => (
              <ToggleGroupItem value={n} key={n}>
                {n} days
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <select
            aria-label="Activity range"
            className="compact-range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            {[7, 30, 90].map((n) => (
              <option key={n} value={n}>
                {n} days
              </option>
            ))}
          </select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.some((d) => d.created || d.completed) ? (
          <ChartContainer config={config} className="plot">
            <AreaChart
              data={data}
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
            >
              <defs>
                {Object.keys(config).map((k) => (
                  <linearGradient
                    key={k}
                    id={"fill-" + k}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={"var(--color-" + k + ")"}
                      stopOpacity={0.36}
                    />
                    <stop
                      offset="100%"
                      stopColor={"var(--color-" + k + ")"}
                      stopOpacity={0.025}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis
                dataKey="date"
                tickFormatter={dateLabel}
                minTickGap={32}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                width={22}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) => dateLabel(String(v))}
                    indicator="dot"
                  />
                }
              />
              {(["completed", "created"] as const).map((k) => (
                <Area
                  key={k}
                  dataKey={k}
                  type="monotone"
                  fill={"url(#fill-" + k + ")"}
                  stroke={"var(--color-" + k + ")"}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="empty">No task activity in the last {range} days.</p>
        )}
      </CardContent>
    </Card>
  );
}

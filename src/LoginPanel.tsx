import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { Icon } from "./Icon";

const teams = [["Frontend", "code"], ["Backend", "database"], ["Security", "shield"]] as const;

function Workstream({ team, index, time }: {
  team: typeof teams[number]; index: number; time: MotionValue<number>;
}) {
  const start = 0.15 + index * 0.04;
  const opacity = useTransform(time, [start, start + 0.09, 0.9, 0.99], [0, 1, 1, 0]);
  const y = useTransform(time, [start, start + 0.09], [-14, 0]);
  const approval = 0.4 + index * 0.045;
  const scaleX = useTransform(time, [approval, approval + 0.12], [0, 1]);
  return <motion.div className="login-team" style={{ opacity, y }}>
    <Icon name={team[1]} /><span>{team[0]}</span>
    <motion.i style={{ scaleX }} />
  </motion.div>;
}

export default function LoginPanel() {
  const time = useMotionValue(0.75);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const playback = animate(time, [0, 1], { duration: 12, repeat: Infinity, ease: "linear", autoplay: false });
    function sync() {
      if (preference.matches) {
        playback.pause();
        playback.time = 9;
        time.set(0.75);
      } else if (document.hidden) playback.pause();
      else playback.play();
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    return () => {
      playback.stop();
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
    };
  }, [time]);
  const opacity = useTransform(time, [0, 0.07, 0.9, 0.99], [0, 1, 1, 0]);
  const approved = useTransform(time, [0.59, 0.66], [0, 1]);
  const drift = useTransform(time, [0, 0.5, 1], [0, 8, 0]);
  const branch = useTransform(time, [0.12, 0.24], [0, 1]);
  return <aside className="login-panel" aria-labelledby="delivery-title">
    <motion.div aria-hidden="true" className="login-tiles" style={{ x: drift }}><i/><i/><i/><i/></motion.div>
    <div className="login-scene" aria-hidden="true">
      <motion.div className="login-brief" style={{ opacity }}><Icon name="brief" />Client brief
        <motion.span style={{ opacity: approved }}><Icon name="check" />Approved</motion.span>
      </motion.div>
      <motion.div className="login-branch" style={{ opacity, scaleY: branch }} />
      <div className="login-teams">{teams.map((team, index) => <Workstream key={team[0]} {...{team, index, time}} />)}</div>
    </div>
    <div className="login-caption"><h2 id="delivery-title">From brief to delivery.</h2>
    <p>Turn a client brief into a plan, give every team clear ownership, and follow the work through testing.</p></div>
  </aside>;
}

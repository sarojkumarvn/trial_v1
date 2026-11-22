import GoogleMark from "./GoogleMark";
import localPath from "./localPath";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Brand } from "./Walkthrough";
import LoginPanel from "./LoginPanel";
import "./Login.css";

// The password handler receives a same-origin form POST and owns the session and redirect.
const passwordAction = localPath(import.meta.env.VITE_PASSWORD_SIGN_IN_PATH);
const googleAction = localPath(import.meta.env.VITE_GOOGLE_SIGN_IN_PATH);
const resetPath = localPath(import.meta.env.VITE_PASSWORD_RESET_PATH);
const signupPath = localPath(import.meta.env.VITE_SIGN_UP_PATH) ?? "/signup";

function LoginForm() {
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  const [busy, setBusy] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState("");
  useEffect(() => {
    function restore() { locked.current = false; setBusy(""); }
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  function start(method: string) { locked.current = true; setBusy(method); setNotice(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    if (locked.current) { event.preventDefault(); return; }
    const issues = {
      email: email.current?.validity.valid ? "" : "Enter a valid work email address.",
      password: password.current?.value ? "" : "Enter your password.",
    };
    setErrors(issues);
    setNotice("");
    if (issues.email || issues.password || !passwordAction) {
      event.preventDefault();
      if (issues.email) email.current?.focus();
      else if (issues.password) password.current?.focus();
      else setNotice("Email sign-in is unavailable. Contact your workspace administrator.");
    } else start("password");
  }
  return <div className="login-column">
    <Brand />
    <h1>Welcome back!</h1>
    <p className="login-intro">Sign in to Trial to review project plans, delegate work, and see what’s ready to ship.</p>
    <form method="post" action={passwordAction} noValidate onSubmit={submit} aria-busy={Boolean(busy)}>
      <div className="login-field"><label htmlFor="work-email">Work email</label>
        <input ref={email} id="work-email" type="email" name="email" autoComplete="username" required placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined}
          onInput={() => {setErrors(old => ({ ...old, email: "" })); setNotice("");}} />
        {errors.email && <p className="login-error" id="email-error">{errors.email}</p>}
      </div>
      <div className="login-field"><div className="login-label"><label htmlFor="login-password">Password</label>
        {resetPath ? <a href={resetPath}>Forgot password?</a> : <button type="button" className="login-link" onClick={() => setNotice("Password recovery is unavailable. Contact your workspace administrator.")}>Forgot password?</button>}
      </div><div className="login-password">
        <input ref={password} id="login-password" type={visible ? "text" : "password"} name="password" autoComplete="current-password" required placeholder="Enter your password"
          aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined}
          onInput={() => {setErrors(old => ({ ...old, password: "" })); setNotice("");}} />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{visible && <path d="m3 3 18 18"/>}</svg>
        </button></div>
        {errors.password && <p id="password-error" className="login-error">{errors.password}</p>}
      </div>
      <button className="login-primary" disabled={Boolean(busy)}>{busy === "password" ? "Signing in…" : "Sign in"}</button>
    </form>
    <div className="login-divider">or</div>
    <button className="login-google" disabled={Boolean(busy)} onClick={() => {
      if (locked.current) return;
      if (!googleAction) { setNotice("Google sign-in is unavailable. Contact your workspace administrator."); return; }
      start("google"); window.location.assign(googleAction);
    }}><GoogleMark />{busy === "google" ? "Connecting to Google…" : "Continue with Google"}</button>
    <p className="login-signup">New to Trial? <a href={signupPath}>Sign up</a></p>
    <p className="login-notice" role="status">{notice}</p>
  </div>;
}

export default function Login() {
  useEffect(() => { document.title = "Sign in to Trial"; }, []);
  return <main className="login-page"><LoginForm /><LoginPanel /></main>;
}

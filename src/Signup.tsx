import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Brand } from "./Walkthrough";
import LoginPanel from "./LoginPanel";
import GoogleMark from "./GoogleMark";
import localPath from "./localPath";
import { finishSignup, googleSession, lookupInvitation, sendCode, type Invitation } from "./signupService";
import "./Login.css";
import "./Signup.css";

const params = new URLSearchParams(window.location.search);
const linkedCode = params.get("invite")?.trim() ?? "";
const googleReturn = params.get("google") === "return";
const normalize = (email: string) => email.trim().toLowerCase();
const titles = ["Let’s get you set up.", "Are you creating a workspace or joining your team?", "Verify and finish", "Request received"];
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string; label: string; error?: string; action?: ReactNode;
};
function Field({ id, label, error, action, ...props }: FieldProps) {
  return <div className="login-field">
    <label htmlFor={id}>{label}</label>
    <div className={action ? "login-password" : undefined}>
      <input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? id + "-error" : undefined} />
      {action}
    </div>
    {error && <p className="login-error" id={id + "-error"}>{error}</p>}
  </div>;
}

function SignupForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [path, setPath] = useState<"create" | "join" | "">(linkedCode ? "join" : "");
  const [organization, setOrganization] = useState("");
  const [inviteCode, setInviteCode] = useState(linkedCode);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [attempt, setAttempt] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [initializing, setInitializing] = useState(googleReturn);
  const [linkError, setLinkError] = useState("");
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(1);
  const google = Boolean(googleEmail && normalize(googleEmail) === normalize(email));
  const mismatch = path === "join" && invitation && normalize(invitation.email) !== normalize(email);
  const checkingLink = Boolean(step === 2 && path === "join" && linkedCode && inviteCode === linkedCode && !invitation && !linkError);
  const pending = Boolean(busy || initializing);
  useEffect(() => {
    document.title = "Sign up for Trial";
    if (!googleReturn) return;
    const controller = new AbortController();
    googleSession(controller.signal).then(account => {
      if (controller.signal.aborted) return;
      if (!account) throw new Error("Google returned no verified email. Continue with your work email.");
      setGoogleEmail(account.email);
      setEmail(account.email);
      setName(account.name);
      if (account.name.trim()) setStep(2);
    }).catch(error => {
      if (!controller.signal.aborted) setNotice(error.message);
    }).finally(() => { if (!controller.signal.aborted) setInitializing(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!linkedCode || inviteCode !== linkedCode || path !== "join" || step !== 2 || invitation) return;
    const controller = new AbortController();
    lookupInvitation(linkedCode, controller.signal).then(result => {
      if (!controller.signal.aborted) setInvitation(result);
    }).catch(error => { if (!controller.signal.aborted) setLinkError(error.message); });
    return () => controller.abort();
  }, [inviteCode, path, step, invitation]);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted) { locked.current = false; setBusy(""); }
    }
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  function go(next: number) { setNotice(""); setErrors({}); setStep(next); setVisible(false); }
  function invalid(id: string, message: string) {
    setErrors({ [id]: message });
    document.getElementById(id)?.focus();
  }
  async function run(label: string, action: () => Promise<void>) {
    if (locked.current || initializing) return;
    locked.current = true;
    setBusy(label); setNotice(""); setErrors({});
    try { await action(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Try again later."); }
    finally { locked.current = false; setBusy(""); }
  }
  async function issueCode() {
    const id = await sendCode(email.trim());
    setAttempt(id); setCode("");
  }
  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || checkingLink || locked.current) return;
    if (step === 1) {
      if (!name.trim()) return invalid("full-name", "Enter your full name.");
      const field = event.currentTarget.elements.namedItem("work-email") as HTMLInputElement;
      if (!field.validity.valid) return invalid("work-email", "Enter a valid work email address.");
      go(2); return;
    }
    if (step === 2) {
      if (!path) return invalid("create-choice", "Choose how you want to join Trial.");
      if (path === "create" && !organization.trim()) return invalid("organization", "Enter your organization name.");
      if (path === "join" && !inviteCode.trim()) return invalid("invitation-code", "Enter your invitation code.");
      await run("Checking…", async () => {
        if (path === "join") {
          const details = invitation ?? await lookupInvitation(inviteCode.trim());
          setInvitation(details); setLinkError("");
          // Leave newly looked-up details visible for review before advancing.
          if (!invitation || normalize(details.email) !== normalize(email)) return;
        }
        go(3);
        if (!google && !attempt) await issueCode();
      });
      return;
    }
    if (!google) {
      if (!attempt) { setNotice("Send a verification code before finishing signup."); return; }
      if (!/^\d{6}$/.test(code)) return invalid("verification-code", "Enter the six-digit code from your email.");
      if (!password) return invalid("new-password", "Create a password.");
    }
    await run("Submitting…", async () => {
      const destination = await finishSignup({ name: name.trim(), email: email.trim() },
        path === "create" ? { organization: organization.trim() } : { invitationCode: inviteCode.trim() },
        google ? { provider: "google" } : { attemptId: attempt, code, password });
      setPassword(""); setCode(""); setAttempt("");
      if (destination) window.location.assign(destination);
      else go(4);
    });
  }
  function startGoogle() {
    if (pending || locked.current) return;
    const entry = localPath(import.meta.env.VITE_GOOGLE_SIGN_IN_PATH);
    if (!entry) { setNotice("Google sign-up is unavailable. Continue with your work email."); return; }
    const callback = new URL("/signup", window.location.origin);
    callback.searchParams.set("google", "return");
    if (inviteCode) callback.searchParams.set("invite", inviteCode);
    const url = new URL(entry);
    url.searchParams.set("returnTo", callback.pathname + callback.search);
    locked.current = true; setBusy("Connecting to Google…"); window.location.assign(url);
  }
  return <div className="login-column signup-column">
    <Brand />
    <div className="signup-step" key={step}>
      {step < 4 && <p className="signup-indicator">Step {step} of 3 <span>{["Your details", "Your workspace", "Verify and finish"][step - 1]}</span></p>}
      <h1 ref={heading} tabIndex={-1}>{titles[step - 1]}</h1>
      {step === 4 ? <p className="login-intro">Trial will email you at {email} when your workspace is approved.</p> :
      <form onSubmit={next} method="post" noValidate aria-busy={pending}>
        <fieldset disabled={pending} className="signup-fields" onChange={() => { setErrors({}); setNotice(""); }}>
          {step === 1 && <>
            <Field id="full-name" label="Full name" autoComplete="name" value={name} placeholder="Your full name" required onChange={e => setName(e.target.value)} error={errors["full-name"]} />
            <Field id="work-email" label="Work email" type="email" autoComplete="email" value={email} placeholder="you@company.com" required onChange={e => {
              if (normalize(e.target.value) !== normalize(email)) { setAttempt(""); setCode(""); setPassword(""); setGoogleEmail(""); }
              setEmail(e.target.value);
            }} error={errors["work-email"]} />
          </>}
          {step === 2 && <>
            <fieldset className="signup-choices"><legend className="signup-sr">Workspace options</legend>
              {(["create", "join"] as const).map(choice => <label key={choice}>
                <input id={choice + "-choice"} type="radio" name="workspace" checked={path === choice} onChange={() => setPath(choice)} aria-describedby={errors["create-choice"] ? "choice-error" : undefined}/>
                {choice === "create" ? "Create a workspace" : "Join an existing workspace"}
              </label>)}
            </fieldset>
            {errors["create-choice"] && <p className="login-notice" id="choice-error">{errors["create-choice"]}</p>}
            {path === "create" && <>
              <Field id="organization" label="Organization name" autoComplete="organization" value={organization} required onChange={e => setOrganization(e.target.value)} error={errors.organization} />
              <p className="signup-note">You’re requesting Admin access for this workspace.</p>
            </>}
            {path === "join" && <>
              <Field id="invitation-code" label="Invitation code" value={inviteCode} spellCheck={false} autoCapitalize="none" onChange={e => { setInviteCode(e.target.value); setInvitation(null); setLinkError(""); }} error={errors["invitation-code"]} />
              {invitation ? <dl className="signup-summary"><dt>Organization</dt><dd>{invitation.organization}</dd><dt>Invited email</dt><dd>{invitation.email}</dd><dt>Assigned role</dt><dd>{invitation.role}</dd></dl> : linkError && <p className="login-notice" role="status">{linkError}</p>}
              {mismatch && <p className="login-notice" role="status">This invitation is for {invitation.email}. Go back to change your work email.</p>}
            </>}
          </>}
          {step === 3 && <>
            <p className="login-intro">{google ? "Verified Google account" : attempt ? "We sent a code to" : "Verify your work email"} <strong>{email}</strong></p>
            {google ? <p className="signup-note">{path === "create" ? `Request Admin access for ${organization}. Trial will review your request.` : `Join ${invitation?.organization} as ${invitation?.role}.`}</p> : <>
              <Field id="verification-code" label="Verification code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} error={errors["verification-code"]} />
              <Field id="new-password" label="Create password" type={visible ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} error={errors["new-password"]} action={<button className="signup-show" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button>} />
              <div className="signup-links"><button className="login-link" type="button" onClick={() => run("Sending code…", issueCode)}>{attempt ? "Resend code" : "Send code"}</button><button className="login-link" type="button" onClick={() => go(1)}>Change email</button></div>
            </>}
          </>}
          <div className="signup-actions">
            {step > 1 && <button type="button" className="signup-back" onClick={() => go(step - 1)}>Back</button>}
            <button className="login-primary" disabled={checkingLink || Boolean(mismatch && step === 2)}>{busy || (initializing ? "Checking account…" : checkingLink ? "Checking invitation…" : step < 3 ? "Next" : path === "create" ? "Request workspace" : "Join workspace")}</button>
          </div>
        </fieldset>
      </form>}
      {step === 1 && <><div className="login-divider">or</div>
        <button className="login-google" disabled={pending} onClick={startGoogle}><GoogleMark />Continue with Google</button>
        <p className="login-signup">Already have an account? <a href="/login">Log in</a></p></>}
      <p className="login-notice" role="status">{notice}</p>
    </div>
  </div>;
}
export default function Signup() {
  return <main className="login-page signup-page"><SignupForm /><LoginPanel /></main>;
}


## Login integration

The Vite build accepts these optional same-origin paths for `/login`.

| Variable | Destination |
| --- | --- |
| `VITE_PASSWORD_SIGN_IN_PATH` | A server endpoint accepting a form-encoded POST with `email` and `password`. The server handles validation, failure responses, session cookies, and the post-login redirect. |
| `VITE_GOOGLE_SIGN_IN_PATH` | A server route that starts Google OAuth and handles the callback through the configured provider. |
| `VITE_PASSWORD_RESET_PATH` | The password recovery page. |
| `VITE_SIGN_UP_PATH` | The registration page. |

Use paths beginning with a slash. With a path unset, its control explains availability inline. The frontend does not persist credentials.

## Signup integration

`/signup` is the default registration page linked from login. It holds the draft in memory. Invitation links use `/signup?invite=<code>`. The Google start route configured above receives a same-origin `returnTo` path. It must retain that path through OAuth and return the user there with a server session.

The signup UI expects the following same-origin JSON endpoints. They are backend dependencies.

| Endpoint | Request | Successful response |
| --- | --- | --- |
| GET `/api/signup/session` | OAuth session cookie after return | `{provider:"google", emailVerified:true, email, name}` from the provider-confirmed identity |
| POST `/api/signup/invitations/lookup` | `{code}` | `{organization, email, role}` from a valid invitation |
| POST `/api/signup/verification` | `{email}` | `{attemptId}` after issuing a six-digit email code |
| POST `/api/signup/requests` | Identity, verification, and `organization` | `{status:"pending"}` after recording the Admin request for approval |
| POST `/api/signup/join` | Identity, verification, and `invitationCode` | `{status:"joined", workspacePath}` after granting membership and establishing a session |

Final requests include `name` and `email`. Email signup includes `attemptId`, `code`, and `password`. Google signup includes `provider:"google"`; the server must check its verified session. The backend owns code delivery, expiry, resend invalidation, password handling, invitation consumption and email matching, role assignment, approval, and notification. Use non-success HTTP status codes with a user-facing JSON `message` for rejected actions.

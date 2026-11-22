import { Component, type ReactNode } from "react";

export class Boundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main role="alert">
          <h1>Unable to load this page</h1>
          <button onClick={() => location.reload()}>Reload page</button>
        </main>
      );
    return this.props.children;
  }
}

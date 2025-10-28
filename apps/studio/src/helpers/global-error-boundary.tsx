import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import * as React from "react";

export class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("❌ Error caught by boundary:", error);
    console.error("❌ Component stack:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <FullScreenError
          title={"Unexpected Error"}
          icon="dead-smiley"
          fullScreen={true}
          subtitle={this.state.error.message}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

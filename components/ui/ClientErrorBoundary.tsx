"use client";

import React from "react";
import ErrorBoundaryFallback from "./ErrorBoundaryFallback";

interface Props {
  children: React.ReactNode;
  compact?: boolean;
  message?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ClientErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Section error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          reset={() =>
            this.setState({ hasError: false, error: undefined })
          }
          compact={this.props.compact}
          message={this.props.message}
        />
      );
    }
    return this.props.children;
  }
}

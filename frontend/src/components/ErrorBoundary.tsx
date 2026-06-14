import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="card shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="card-body text-center p-5">
              <h4 className="card-title text-danger mb-3">Something went wrong</h4>
              <p className="text-muted mb-4">
                {this.state.error?.message || 'An unexpected error occurred.'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

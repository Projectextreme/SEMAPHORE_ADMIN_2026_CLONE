import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.hash = '#/dashboard';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-wrap">
              <AlertTriangle className="error-boundary-icon" size={36} />
            </div>
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              {this.state.error?.message || 'An unexpected rendering error occurred while displaying this section.'}
            </p>

            <div className="error-boundary-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleReset}
                title="Attempt to re-render component"
              >
                <RefreshCw size={15} /> Try Again
              </button>
              <button 
                className="btn btn-secondary"
                onClick={this.handleGoDashboard}
                title="Return to Dashboard"
              >
                <Home size={15} /> Go to Dashboard
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <details className="error-boundary-details">
                <summary>Component Stack Trace</summary>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

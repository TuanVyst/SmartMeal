import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '80px auto',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '16px',
          color: '#991b1b',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Đã xảy ra lỗi không mong muốn</h2>
          <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '20px' }}>
            {this.state.error?.message || 'Có lỗi xảy ra khi tải trang.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

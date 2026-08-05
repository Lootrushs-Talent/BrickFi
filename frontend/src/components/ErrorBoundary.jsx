import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Something broke</p>
        <h1 className="mt-3 font-serif text-4xl">The page hit an unexpected error.</h1>
        <p className="mt-4 text-sm text-estate-200">{this.state.error.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-gold px-5 py-2 text-sm font-medium text-estate-950"
        >
          Reload
        </button>
      </div>
    );
  }
}

import { Component, type ReactNode } from 'react'

interface Props {
  readonly children: ReactNode
  readonly fallback: ReactNode
  readonly onError?: (error: Error) => void
}

export class MascotErrorBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

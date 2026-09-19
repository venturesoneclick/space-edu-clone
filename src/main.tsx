import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

class BootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <pre
          style={{
            color: '#fff',
            background: '#020408',
            minHeight: '100vh',
            padding: 24,
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          {this.state.error.stack || String(this.state.error)}
        </pre>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')

if (!rootEl) {
  document.body.textContent = 'Missing #root'
} else {
  import('./App.tsx')
    .then(({ default: App }) => {
      createRoot(rootEl).render(
        <StrictMode>
          <BootErrorBoundary>
            <App />
          </BootErrorBoundary>
        </StrictMode>,
      )
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.stack || err.message : String(err)
      rootEl.style.minHeight = '100vh'
      rootEl.style.color = '#fff'
      rootEl.style.padding = '24px'
      rootEl.style.whiteSpace = 'pre-wrap'
      rootEl.style.fontFamily = 'monospace'
      rootEl.textContent = message
    })
}

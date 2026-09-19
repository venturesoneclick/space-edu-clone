import { Component, lazy, Suspense, type ReactNode } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EarthCanvas from './components/EarthCanvas';
import OverlayContent from './components/OverlayContent';
import ContentSections from './components/ContentSections';
import NextSection from './components/NextSection';
import { useSmoothScroll } from './hooks/useSmoothScroll';

const FlyingPostersSection = lazy(() => import('./components/FlyingPostersSection'));

class SectionErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function App() {
  useSmoothScroll();

  return (
    <div className="relative w-full min-h-screen bg-void text-white selection:bg-accent-cyan/30">
      <Navbar />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <EarthCanvas />
      </div>

      <OverlayContent />
      <ContentSections />

      <SectionErrorBoundary>
        <Suspense fallback={null}>
          <FlyingPostersSection />
        </Suspense>
      </SectionErrorBoundary>

      <div className="relative z-20">
        <NextSection />
        <Footer />
      </div>
    </div>
  );
}

export default App;

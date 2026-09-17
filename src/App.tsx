import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EarthCanvas from './components/EarthCanvas';
import OverlayContent from './components/OverlayContent';
import ContentSections from './components/ContentSections';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function App() {
  useSmoothScroll();

  return (
    <div className="relative w-full min-h-screen bg-void text-white selection:bg-accent-cyan/30">
      <Navbar />
      
      {/* Fixed Background Layer for Three.js */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <EarthCanvas />
      </div>

      {/* Scrollable DOM Content */}
      <OverlayContent />
      
      {/* Downward Page Content overlaying Hero */}
      <ContentSections />
      
      <Footer />
    </div>
  );
}

export default App;

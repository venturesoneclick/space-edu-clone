import { ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
      <div className="font-serif text-3xl tracking-wide text-white pointer-events-auto cursor-pointer">
        oneclickventures
      </div>
      <div className="flex items-center gap-8 pointer-events-auto">
        <a href="#what-we-do" className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          What We Do
        </a>
        <a href="#our-approach" className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          Our Approach
        </a>
        <a href="#how-we-work" className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          How We Work
        </a>
        <a href="#contact" className="text-sm font-medium text-white/90 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          Contact
        </a>
        <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white hover:text-void transition-all flex items-center gap-2 group cursor-pointer">
          Partner With Us
          <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
        </button>
      </div>
    </nav>
  );
}

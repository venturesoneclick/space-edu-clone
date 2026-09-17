import { ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
      <div className="font-serif text-2xl tracking-wide text-white pointer-events-auto cursor-pointer">
        space.edu
      </div>
      <div className="flex items-center gap-8 pointer-events-auto">
        <a href="#curriculum" className="text-sm font-medium text-text-subtle hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          Curriculum
        </a>
        <a href="#about" className="text-sm font-medium text-text-subtle hover:text-white transition-colors uppercase tracking-widest hidden md:block">
          About
        </a>
        <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white hover:text-void transition-all flex items-center gap-2 group cursor-pointer">
          Enroll Now
          <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
        </button>
      </div>
    </nav>
  );
}

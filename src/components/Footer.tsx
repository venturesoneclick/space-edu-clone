import { Globe, Tv, Navigation } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-void text-white overflow-hidden pb-12 pt-24 border-t border-white/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-serif font-bold text-white/5 whitespace-nowrap pointer-events-none tracking-tighter select-none">
        space.edu
      </div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
        <div className="flex flex-col items-center md:items-start gap-6">
          <div className="font-serif text-3xl">space.edu</div>
          <div className="flex items-center gap-4 text-text-subtle">
            <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"><Globe className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"><Tv className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"><Navigation className="w-5 h-5" /></a>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm font-mono tracking-widest text-text-subtle uppercase">
          <a href="#" className="hover:text-white transition-colors">Planets</a>
          <a href="#" className="hover:text-white transition-colors">Trailer</a>
          <a href="#" className="hover:text-white transition-colors">Tickets</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
        </div>
      </div>
    </footer>
  );
}

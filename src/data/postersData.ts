import cncMachining from '../assets/posters/cnc-machining.jpg';
import logistics from '../assets/posters/logistics.jpg';
import digitalMarketing from '../assets/posters/digital-marketing.jpg';
import realEstate from '../assets/posters/real-estate.jpg';
import globalTrade from '../assets/posters/global-trade.jpg';
import b2b from '../assets/posters/b2b.jpg';

export interface PosterItem {
  id: string;
  title?: string;
  src: string;
  alt?: string;
}

export const POSTER_ITEMS: PosterItem[] = [
  {
    id: 'poster-1',
    title: 'CNC Machining',
    src: cncMachining,
    alt: 'Precision CNC machined metal parts',
  },
  {
    id: 'poster-2',
    title: 'Logistics',
    src: logistics,
    alt: 'Overhead view of a truck moving through shipping containers',
  },
  {
    id: 'poster-3',
    title: 'Digital Marketing',
    src: digitalMarketing,
    alt: 'Editorial digital marketing campaign visual',
  },
  {
    id: 'poster-4',
    title: 'Real Estate',
    src: realEstate,
    alt: 'Architectural tower rendering with landscape sketch',
  },
  {
    id: 'poster-5',
    title: 'Global Trade',
    src: globalTrade,
    alt: 'Cargo ship and aircraft on a global shipping network',
  },
  {
    id: 'poster-6',
    title: 'B2B',
    src: b2b,
    alt: 'Business handshake representing B2B sales',
  },
];

export const posterImageUrls: string[] = POSTER_ITEMS.map((item) => item.src);

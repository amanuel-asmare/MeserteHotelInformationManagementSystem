'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover"
      />
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition">
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}
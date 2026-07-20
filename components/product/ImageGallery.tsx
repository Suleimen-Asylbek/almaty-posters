'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ThumbnailStrip from './ThumbnailStrip';
import Lightbox from './Lightbox';

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  isNew?: boolean;
  featured?: boolean;
  priority?: boolean;
}

const DRAG_THRESHOLD = 8;

export default function ImageGallery({
  images,
  productTitle,
  isNew = false,
  featured = false,
  priority = false,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const safeIndex = images.length > 0 ? Math.min(selectedIndex, images.length - 1) : 0;

  const openLightbox = useCallback(() => {
    if (isDragging.current) return;
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    triggerRef.current?.focus();
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox();
    }
  };

  const visibleIndices = useMemo(() => {
    const prev = (safeIndex - 1 + images.length) % images.length;
    const next = (safeIndex + 1) % images.length;
    return [prev, safeIndex, next];
  }, [safeIndex, images.length]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full">
            НОВИНКА
          </span>
        )}
        {featured && (
          <span className="bg-[#111111] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="white"
              className="shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            ХИТ
          </span>
        )}
      </div>

      <div
        ref={triggerRef}
        className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F6F6F6] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`Открыть увеличенное изображение «${productTitle}»`}
        onKeyDown={handleTriggerKeyDown}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
          isDragging.current = false;
        }}
        onTouchMove={(e) => {
            if (!touchStartX.current || !touchStartY.current) return;
            const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
            const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
            if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
                isDragging.current = true;
            }
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          touchStartY.current = null;
          if (Math.abs(delta) > 50) {
              delta > 0 ? goPrev() : goNext();
          } else {
              isDragging.current = false;
          }
        }}
      >
        {images.map((image, index) => {
          if (!visibleIndices.includes(index)) return null;
          
          return (
            <motion.div
              key={image}
              initial={false}
              animate={{ opacity: index === safeIndex ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={image}
                alt={`${productTitle} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={priority && index === safeIndex}
              />
            </motion.div>
          );
        })}

        {images.length > 1 && (
            <>
                <button 
                    type="button"
                    aria-label="Предыдущее изображение"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    type="button"
                    aria-label="Следующее изображение"
                    onClick={(e) => { e.stopPropagation(); goNext(); }} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-end p-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
            <ZoomIn size={16} className="text-[#111111]" />
          </div>
        </div>
      </div>

      <ThumbnailStrip
        images={images}
        selectedIndex={safeIndex}
        onSelect={setSelectedIndex}
        productTitle={productTitle}
      />

      <p className="text-center text-xs text-[#999999] mt-2">
        Нажмите для увеличения
      </p>

      {lightboxOpen && (
        <Lightbox
          images={images}
          initialIndex={safeIndex}
          productTitle={productTitle}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
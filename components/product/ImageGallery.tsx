'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import ThumbnailStrip from './ThumbnailStrip';
import Lightbox from './Lightbox';

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  isNew?: boolean;
  featured?: boolean;
  priority?: boolean;
}

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

  const safeIndex = images.length > 0 ? Math.min(selectedIndex, images.length - 1) : 0;

  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(0);
    }
  }, [images, selectedIndex]);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox();
    }
  };

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
      >
        {images.length > 0 && (
          <Image
            src={images[safeIndex]}
            alt={productTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02] transform-gpu"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
          />
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
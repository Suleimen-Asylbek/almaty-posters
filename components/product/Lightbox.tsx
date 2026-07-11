'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  productTitle: string;
  onClose: () => void;
}

const clamp = (value: number, length: number) =>
  Math.min(Math.max(value, 0), Math.max(length - 1, 0));

const FOCUSABLE_SELECTOR = `
button,
[href],
input,
select,
textarea,
summary,
iframe,
audio[controls],
video[controls],
[tabindex]:not([tabindex="-1"])
`;

export default function Lightbox({
  images,
  initialIndex,
  productTitle,
  onClose,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(() =>
    clamp(initialIndex, images.length)
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const previousFocusRef = useRef<HTMLElement | null>(null);

  const touchStartX = useRef<number | null>(null);

  const preloadedRef = useRef(new Set<string>());
  const previousImagesRef = useRef(images);
  const didOpenRef = useRef(false);

  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Закрываем только если массив
   * стал пустым после открытия.
   */
  useEffect(() => {
    if (!didOpenRef.current) {
      didOpenRef.current = true;
      return;
    }

    if (images.length === 0) {
      onClose();
    }
  }, [images.length, onClose]);

  /*
   * Если пришёл новый массив —
   * очищаем preload.
   */
  useEffect(() => {
    if (previousImagesRef.current !== images) {
      previousImagesRef.current = images;
      preloadedRef.current.clear();
    }
  }, [images]);

  /*
   * Синхронизация индекса.
   *
   * Если initialIndex изменился —
   * переходим на него.
   *
   * Иначе просто clamp.
   */
  const previousInitialIndex = useRef(initialIndex);

  useEffect(() => {
    setCurrentIndex((prev) => {
      const max = Math.max(images.length - 1, 0);

      if (previousInitialIndex.current !== initialIndex) {
        previousInitialIndex.current = initialIndex;
        return clamp(initialIndex, images.length);
      }

      return Math.min(prev, max);
    });
  }, [images, images.length, initialIndex]);

  /*
   * Scroll lock
   */
  useEffect(() => {
    if (!mounted) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const id = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(id);

      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;

      previousFocusRef.current?.focus?.();
    };
  }, [mounted]);

  /*
   * Preload
   */
  useEffect(() => {
    if (!images[currentIndex]) return;

    const preload = (src: string) => {
      if (!src) return;

      if (preloadedRef.current.has(src)) return;

      preloadedRef.current.add(src);

      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
    };

    preload(images[currentIndex]);

    if (images.length > 1) {
      preload(images[(currentIndex + 1) % images.length]);
      preload(images[(currentIndex - 1 + images.length) % images.length]);
    }
  }, [currentIndex, images]);

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;

    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;

    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  /*
   * Keyboard
   */
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          return;

        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          return;

        case 'ArrowRight':
          e.preventDefault();
          goNext();
          return;

        case 'Tab': {
          const root = dialogRef.current;
          if (!root) return;

          const elements = Array.from(
            root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          ).filter((el) => {
            if (el.hasAttribute('disabled')) return false;
            if (el.getAttribute('aria-hidden') === 'true') return false;
            if (getComputedStyle(el).visibility === 'hidden') return false;
            return el.getClientRects().length > 0;
          });

          if (!elements.length) return;

          const first = elements[0];
          const last = elements[elements.length - 1];
          const active = document.activeElement;

          if (!root.contains(active)) {
            e.preventDefault();
            first.focus();
            return;
          }

          if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
            return;
          }

          if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [mounted, goPrev, goNext, onClose]);

  if (!mounted) return null;

  const image = images[currentIndex];

  if (!image) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-lightbox-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <h2 id={titleId} className="sr-only">
        Просмотр изображения: {productTitle}
      </h2>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Изображение {currentIndex + 1} из {images.length}
      </div>

      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/70 transition hover:text-white"
      >
        <X size={32} strokeWidth={1.5} />
      </button>

      {images.length > 1 && (
        <>
          <button
            aria-label="Предыдущее изображение"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            aria-label="Следующее изображение"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div
        className="relative aspect-[3/4] w-full max-w-2xl animate-lightbox-zoom"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchCancel={() => {
          touchStartX.current = null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;

          const delta = e.changedTouches[0].clientX - touchStartX.current;

          touchStartX.current = null;

          if (Math.abs(delta) < 50) return;

          delta > 0 ? goPrev() : goNext();
        }}
      >
        <Image
          src={image}
          alt={productTitle}
          fill
          priority={false}
          sizes="80vw"
          className="object-contain"
        />
      </div>
    </div>,
    document.body
  );
}
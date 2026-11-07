import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), images.length - 1));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
            {currentIndex + 1} / {images.length}
          </span>
          {title && (
            <p className="text-sm font-medium text-zinc-300 truncate max-w-[200px] sm:max-w-md">
              {title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label="縮放圖片"
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉預覽"
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="上一張圖片"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-zinc-800/90 text-zinc-200 hover:text-emerald-400 border border-zinc-800 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="下一張圖片"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-zinc-800/90 text-zinc-200 hover:text-emerald-400 border border-zinc-800 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div
        className={`max-w-[95vw] max-h-[85vh] p-2 flex items-center justify-center transition-transform duration-300 ${
          isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsZoomed(!isZoomed);
        }}
      >
        <img
          src={currentImage}
          alt={`附圖預覽 ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg border border-zinc-800/80 shadow-2xl"
        />
      </div>

      {/* Bottom thumbnails strip when multiple images */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-2 px-4 z-10 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2 p-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-zinc-800">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500/30'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`縮圖 ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

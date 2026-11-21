"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/lib/catalog";

export function ArtworkImageViewer({ images }: { images: MediaAsset[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const image = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft" && hasMultipleImages) showPrevious();
      if (event.key === "ArrowRight" && hasMultipleImages) showNext();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, hasMultipleImages, showNext, showPrevious]);

  if (!image) return null;

  return (
    <div className="artwork-viewer">
      <button className="artwork-image-trigger" type="button" onClick={() => setIsOpen(true)} aria-label="Powiększ zdjęcie dzieła">
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority />
        <span className="zoom-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false"><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 5 5" /></svg>
          <span>Powiększ</span>
        </span>
      </button>
      {hasMultipleImages ? <div className="artwork-image-controls" aria-label="Zdjęcia dzieła">
        <button type="button" onClick={showPrevious} aria-label="Poprzednie zdjęcie">‹</button>
        <span>{activeIndex + 1} / {images.length}</span>
        <button type="button" onClick={showNext} aria-label="Następne zdjęcie">›</button>
      </div> : null}

      {isOpen ? (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label="Powiększone zdjęcie dzieła" onClick={() => setIsOpen(false)}>
          <button ref={closeButtonRef} className="image-modal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Zamknij powiększenie">×</button>
          {hasMultipleImages ? <>
            <button className="image-modal-nav image-modal-prev" type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} aria-label="Poprzednie zdjęcie">‹</button>
            <span className="image-modal-counter" aria-live="polite">{activeIndex + 1} / {images.length}</span>
            <button className="image-modal-nav image-modal-next" type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} aria-label="Następne zdjęcie">›</button>
          </> : null}
          <Image className="image-modal-content" src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="96vw" onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}

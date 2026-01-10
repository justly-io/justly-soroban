import React, { useRef, useEffect } from "react";
import { Maximize2 } from "lucide-react";

interface EvidenceImage {
  id: string;
  url: string;
  description?: string;
}

interface EvidenceCarouselProps {
  images: EvidenceImage[];
}

export const EvidenceCarousel: React.FC<EvidenceCarouselProps> = ({
  images,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = (url: string) => {
    window.open(url, "_blank");
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.style.scrollBehavior = "smooth";
  }, []);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 w-full">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden scroll-snap-x scroll-snap-mandatory scroll-pl-[19px] scroll-pr-[19px] touch-pan-x cursor-grab w-full no-scrollbar"
      >
        <div className="flex gap-4 px-[19px] w-max">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="shrink-0 snap-start snap-always min-w-[273px] w-[273px] h-[196px] rounded-[18px] overflow-hidden relative bg-[#f5f6f9]"
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={image.url}
                  alt={image.description || `Evidence ${index + 1}`}
                  className="w-full h-full object-cover block"
                />
                <button
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 border-none rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-white p-0 z-10 active:bg-white/80"
                  onClick={() => handleFullscreen(image.url)}
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-[#1b1c23]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

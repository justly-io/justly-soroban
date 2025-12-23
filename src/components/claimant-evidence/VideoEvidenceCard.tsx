import React from "react";
import { PlayIcon, FullscreenIcon } from "./icons/EvidenceIcons";
import { CalendarIcon } from "../dispute-overview/CalendarIcon";

interface Evidence {
  id: string;
  type: "video";
  url: string;
  thumbnail?: string;
  description: string;
  uploadDate: string;
}

interface VideoEvidenceCardProps {
  evidence: Evidence;
}

export const VideoEvidenceCard: React.FC<VideoEvidenceCardProps> = ({
  evidence,
}) => {
  const handleFullscreen = () => {
    window.open(evidence.url, "_blank");
  };

  return (
    <div className="bg-white rounded-[18px] p-0 w-[280px] shrink-0 flex flex-col overflow-hidden box-border">
      <div className="relative w-full h-[200px] overflow-hidden bg-[#f5f6f9] flex items-center justify-center">
        {evidence.thumbnail ? (
          <img
            src={evidence.thumbnail}
            alt={evidence.description}
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full bg-[#e0e0e0]" />
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-[2]">
          <PlayIcon size={37} color="#1b1c23" />
        </div>

        <button
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 border-none rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-white p-0 z-[2]"
          onClick={handleFullscreen}
        >
          <FullscreenIcon size={16} color="#1b1c23" />
        </button>
      </div>

      <p className="font-manrope font-normal text-xs text-[#31353b] tracking-[-0.24px] leading-[1.5] m-3 mx-4 line-clamp-3 overflow-hidden">
        {evidence.description}
      </p>

      <div className="flex items-center gap-1.5 bg-[#f5f6f9] px-4 py-2 font-manrope font-semibold text-[10px] text-[#31353b] tracking-[-0.2px] mt-auto">
        <CalendarIcon size={10} color="#31353b" />
        <span>Video recorded on: {evidence.uploadDate}</span>
      </div>
    </div>
  );
};

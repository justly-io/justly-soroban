import React from "react";
import {
  UniversalEvidenceCard,
  UniversalEvidence
} from "./UniversalEvidenceCard";
import { Mic, PlayCircle, Image as ImageIcon } from "lucide-react";

interface UniversalEvidenceListProps {
  type: "audio" | "video" | "image";
  items: UniversalEvidence[];
}

export const UniversalEvidenceList: React.FC<UniversalEvidenceListProps> = ({
  type,
  items,
}) => {
  if (!items || items.length === 0) return null;

  // Configuration map for labels and icons
  const config = {
    audio: { label: "Audio", icon: <Mic size={10} className="text-[#1b1c23]" /> },
    video: { label: "Videos", icon: <PlayCircle size={10} className="text-[#1b1c23]" /> },
    image: { label: "Images", icon: <ImageIcon size={10} className="text-[#1b1c23]" /> },
  };

  const { label, icon } = config[type];

  return (
    <div className="mt-5 flex flex-col gap-3">
      {/* Header Badge */}
      <div className="mx-[19px] flex flex-col gap-3">
        <span className="inline-flex items-center gap-1 bg-[rgba(140,143,255,0.2)] text-[#1b1c23] px-2 py-1 rounded-[11.5px] font-manrope font-extrabold text-[10px] tracking-[-0.2px] w-fit h-[23px]">
          {icon}
          {label}
        </span>
      </div>

      {/* Content Container */}
      {type === "audio" ? (
        // Vertical Stack for Audio
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <UniversalEvidenceCard key={item.id} evidence={item} />
          ))}
        </div>
      ) : (
        // Horizontal Scroll for Images/Video
        <div className="overflow-x-auto overflow-y-hidden no-scrollbar pb-5">
          <div className="flex gap-4 px-[19px] w-max">
            {items.map((item) => (
              <UniversalEvidenceCard key={item.id} evidence={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

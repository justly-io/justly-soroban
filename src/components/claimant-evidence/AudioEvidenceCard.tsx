import React, { useState } from "react";
import { MicrophoneIcon } from "./icons/EvidenceIcons";

interface AudioEvidence {
  id: string;
  title: string;
  duration: string;
  progress?: number; // 0-100
}

interface AudioEvidenceCardProps {
  audio: AudioEvidence;
}

export const AudioEvidenceCard: React.FC<AudioEvidenceCardProps> = ({
  audio,
}) => {
  const [progress] = useState(audio.progress || 0);

  return (
    <div className="bg-[rgba(140,143,255,0.1)] rounded-[16px] p-4 mx-[19px] flex items-center gap-4 box-border">
      <div className="shrink-0">
        <MicrophoneIcon size={35} color="#1b1c23" />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="font-manrope font-extrabold text-[10px] text-[#1b1c23] tracking-[-0.2px] leading-none">
          {audio.title}
        </div>
        <div className="w-full">
          <div className="relative w-full h-[3px] bg-[#d6d8ee] rounded-[1.5px] overflow-visible">
            <div
              className="absolute top-0 left-0 h-full bg-[#8c8fff] rounded-[1.5px] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[9px] h-[9px] bg-[#1b1c23] rounded-full z-10"
              style={{ left: `calc(${progress}% - 4.5px)` }}
            />
          </div>
        </div>
        <div className="font-manrope font-extrabold text-[10px] text-[#1b1c23] tracking-[-0.2px] text-right leading-none">
          {audio.duration}
        </div>
      </div>
    </div>
  );
};

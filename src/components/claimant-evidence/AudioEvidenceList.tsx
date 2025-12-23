import React from "react";
import { AudioEvidenceCard } from "./AudioEvidenceCard";
import { MicrophoneIcon } from "./icons/EvidenceIcons";

interface AudioEvidence {
  id: string;
  title: string;
  duration: string;
  progress?: number;
}

interface AudioEvidenceListProps {
  audio: AudioEvidence;
}

export const AudioEvidenceList: React.FC<AudioEvidenceListProps> = ({
  audio,
}) => {
  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="mx-[19px] flex flex-col gap-3">
        <span className="inline-flex items-center gap-1 bg-[rgba(140,143,255,0.2)] text-[#1b1c23] px-2 py-1 rounded-[11.5px] font-manrope font-extrabold text-[10px] tracking-[-0.2px] w-fit h-[23px]">
          <MicrophoneIcon size={10} color="#1b1c23" />
          Audio
        </span>
      </div>
      <AudioEvidenceCard audio={audio} />
    </div>
  );
};

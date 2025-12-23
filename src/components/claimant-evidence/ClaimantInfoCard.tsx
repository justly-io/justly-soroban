import React from "react";
import { PersonIcon } from "../disputes/icons/BadgeIcons";
import { shortenAddress } from "@/util/wallet";

interface Claimant {
  name: string;
  role: string;
  avatar?: string;
}

interface ClaimantInfoCardProps {
  claimant: Claimant;
}

export const ClaimantInfoCard: React.FC<ClaimantInfoCardProps> = ({
  claimant,
}) => {
  return (
    <div className="bg-white rounded-[18px] p-[22px] mt-4 mx-[19px] flex items-center gap-3 box-border">
      <div className="w-[55px] h-[55px] rounded-full overflow-hidden shrink-0 bg-[#8c8fff] relative">
        {claimant.avatar ? (
          <>
            <img
              src={claimant.avatar}
              alt={claimant.name}
              className="w-full h-full object-cover absolute top-0 left-0 block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const placeholder = target.parentElement?.querySelector(
                  `.avatar-placeholder`,
                ) as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
            />
            <div className="avatar-placeholder w-full h-full bg-[#8c8fff] text-white hidden items-center justify-center font-manrope font-extrabold text-[20px] rounded-full absolute top-0 left-0">
              {claimant.name.charAt(0)}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-[#8c8fff] text-white flex items-center justify-center font-manrope font-extrabold text-[20px] rounded-full absolute top-0 left-0">
            {claimant.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="font-manrope font-extrabold text-[18px] text-[#1b1c23] tracking-[-0.54px] leading-[1.2] m-0">
          Evidence from {shortenAddress(claimant.name)}
        </h2>
        <span className="inline-flex items-center gap-1 bg-[#8c8fff] text-white px-2 py-1 rounded-[6px] font-manrope font-bold text-[10px] tracking-[-0.2px] w-fit">
          <PersonIcon size={10} color="white" />
          {claimant.role}
        </span>
      </div>
    </div>
  );
};

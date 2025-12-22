"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSliceVoting } from "@/hooks/useSliceVoting";
import { useConnect } from "@/providers/ConnectProvider";
import { useGetDispute } from "@/hooks/useGetDispute";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { DisputeOverviewHeader } from "@/components/dispute-overview/DisputeOverviewHeader";
import { TimerCard } from "@/components/dispute-overview/TimerCard";
import { PaginationDots } from "@/components/dispute-overview/PaginationDots";
import { SuccessAnimation } from "@/components/SuccessAnimation";
import {
  Clock,
  Lock,
  User,
  Shield,
  Eye,
  AlertTriangle,
  RefreshCw,
  Key,
  Gavel,
} from "lucide-react";
import { getVoteData } from "@/util/votingStorage";
import { useSliceContract } from "@/hooks/useSliceContract";

export default function RevealPage() {
  const router = useRouter();
  const params = useParams();
  const disputeId = (params?.id as string) || "1";

  const { address } = useConnect();
  const contract = useSliceContract();
  const { revealVote, isProcessing, logs } = useSliceVoting();
  const { dispute } = useGetDispute(disputeId);

  // --- State ---
  const [localVote, setLocalVote] = useState<number | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // --- Logic: Determine UI State ---
  const isTooEarly = dispute ? dispute.status < 2 : true;
  const isRevealOpen = dispute ? dispute.status === 2 : false;
  const isFinished = dispute ? dispute.status > 2 : false;

  const { handlers } = useSwipeGesture({
    onSwipeRight: () => {
      router.push(`/vote/${disputeId}`);
    },
  });

  // --- Load Local Vote Data ---
  useEffect(() => {
    if (address && contract && contract.target) {
      const contractAddress = contract.target as string;
      const storedData = getVoteData(contractAddress, disputeId, address);

      if (storedData) {
        setLocalVote(storedData.vote);
        setHasLocalData(true);
      } else {
        setHasLocalData(false);
      }
    }
  }, [address, disputeId, contract]);

  const handleReveal = async () => {
    const success = await revealVote(disputeId);
    if (success) {
      setShowSuccessAnimation(true);
    } else {
      setMessage({
        type: "error",
        text: "Failed to reveal. Check logs or local data integrity.",
      });
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false);
    router.push("/disputes");
  };

  // --- Helper for Party UI ---
  const getPartyInfo = (role: "claimer" | "defender") => {
    if (role === "claimer") {
      return {
        name: dispute?.claimer
          ? `${dispute.claimer.slice(0, 6)}...${dispute.claimer.slice(-4)}`
          : "Julio Banegas",
        roleLabel: "Claimant",
        avatarUrl: "/images/profiles-mockup/profile-1.jpg",
        fallbackIcon: <User className="w-8 h-8 text-blue-600" />,
        themeColor: "blue",
      };
    }
    return {
      name: dispute?.defender
        ? `${dispute.defender.slice(0, 6)}...${dispute.defender.slice(-4)}`
        : "Micaela Descotte",
      roleLabel: "Defendant",
      avatarUrl: "/images/profiles-mockup/profile-2.jpg",
      fallbackIcon: <Shield className="w-8 h-8 text-gray-600" />,
      themeColor: "gray",
    };
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FC]" {...handlers}>
      {/* 1. Header */}
      <div className="flex-none z-10 bg-[#F8F9FC]/80 backdrop-blur-md">
        <DisputeOverviewHeader onBack={() => router.back()} />
        <TimerCard />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-40 pt-2 scrollbar-hide">
        <div className="flex flex-col gap-6 max-w-sm mx-auto h-full">
          {/* ---------------- STATE 1: TOO EARLY (Voting Phase) ---------------- */}
          {isTooEarly && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center relative border border-gray-200">
                <Clock className="w-10 h-10 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#1b1c23] rounded-full flex items-center justify-center border-[3px] border-white">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="text-center space-y-3 px-4">
                <h3 className="text-xl font-extrabold text-[#1b1c23]">
                  Reveal Phase Locked
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-bold max-w-[260px] mx-auto">
                  The court is still accepting votes. Please wait for the
                  deadline to pass before revealing your decision.
                </p>
              </div>
            </div>
          )}

          {/* ---------------- STATE 2: REVEAL OPEN ---------------- */}
          {isRevealOpen && (
            <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300 h-full">
              <div className="flex justify-between items-end px-1 mt-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1b1c23] leading-tight">
                    Reveal
                    <br />
                    Your Vote
                  </h2>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    Confirm your secret decision on-chain.
                  </p>
                </div>
                {!hasLocalData && (
                  <div className="bg-red-50 text-red-500 p-2 rounded-xl border border-red-100 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {!hasLocalData && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Missing Secret Keys
                    </span>
                    <span className="text-xs leading-relaxed opacity-90">
                      We couldn't find your local vote data. Did you vote on
                      this device?
                    </span>
                  </div>
                </div>
              )}

              {/* CARDS LIST */}
              <div className="flex flex-col gap-4 relative flex-1">
                {/* CLAIMANT CARD */}
                <RevealCard
                  isSelected={localVote === 1}
                  isDimmed={hasLocalData && localVote !== 1} // Fade out if not selected
                  info={getPartyInfo("claimer")}
                />

                {/* VS Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-[#F5F6F9] rounded-full flex items-center justify-center">
                      <span className="text-[9px] font-black text-gray-400">
                        VS
                      </span>
                    </div>
                  </div>
                </div>

                {/* DEFENDANT CARD */}
                <RevealCard
                  isSelected={localVote === 0}
                  isDimmed={hasLocalData && localVote !== 0}
                  info={getPartyInfo("defender")}
                />
              </div>

              {/* Processing Logs */}
              {isProcessing && (
                <div className="mx-auto flex items-center gap-2 text-[10px] font-bold text-[#8c8fff] animate-pulse bg-white px-4 py-2 rounded-full shadow-sm border border-[#8c8fff]/20">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{logs || "Decrypting & Verifying..."}</span>
                </div>
              )}
            </div>
          )}

          {/* ---------------- STATE 3: FINISHED ---------------- */}
          {isFinished && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center animate-in fade-in duration-500 min-h-[400px]">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-200">
                <Gavel className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#1b1c23]">
                  Dispute Closed
                </h3>
                <p className="text-xs text-gray-500 font-bold px-8 max-w-xs mx-auto">
                  The ruling has been executed. Check your portfolio for the
                  final verdict and rewards.
                </p>
              </div>
              <button
                onClick={() => router.push(`/disputes/${disputeId}`)}
                className="mt-4 px-8 py-4 bg-white border border-gray-200 text-[#1b1c23] rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95"
              >
                Return to Overview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Action Bar */}
      {isRevealOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent z-20 flex justify-center pb-8">
          <div className="w-full max-w-sm flex flex-col gap-4">
            <div className="mb-2">
              <PaginationDots currentIndex={3} total={4} />
            </div>

            <button
              className={`
                  w-full py-4 px-6 rounded-2xl font-manrope font-semibold tracking-wide transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(27,28,35,0.2)]
                  flex items-center justify-center gap-2
                  ${
                    isProcessing || !hasLocalData
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[#1b1c23] text-white hover:scale-[1.02] active:scale-[0.98]"
                  }
                `}
              onClick={() => void handleReveal()}
              disabled={isProcessing || !hasLocalData}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>REVEALING...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>REVEAL VOTE</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!isRevealOpen && (
        <div className="fixed bottom-8 left-0 right-0 z-20">
          <PaginationDots currentIndex={3} total={4} />
        </div>
      )}

      {showSuccessAnimation && (
        <SuccessAnimation onComplete={handleAnimationComplete} />
      )}
    </div>
  );
}

// --- MODERN REVEAL CARD (Matches Vote Card) ---

interface RevealCardProps {
  isSelected: boolean;
  isDimmed: boolean;
  info: {
    name: string;
    roleLabel: string;
    avatarUrl: string;
    fallbackIcon: React.ReactNode;
    themeColor: string;
  };
}

function RevealCard({ isSelected, isDimmed, info }: RevealCardProps) {
  // Dynamic Styles
  const containerStyle = isSelected
    ? `border-[#1b1c23] bg-white ring-2 ring-[#1b1c23] shadow-lg z-10`
    : "border-transparent bg-white shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] border border-gray-100";

  // If dimmed (not selected), apply heavy opacity
  const dimStyle = isDimmed
    ? "opacity-40 grayscale blur-[0.5px] scale-[0.98]"
    : "scale-100 opacity-100";

  return (
    <div
      className={`
        relative w-full rounded-[24px] p-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        flex items-center gap-4 h-[100px]
        ${containerStyle}
        ${dimStyle}
      `}
    >
      {/* 1. Avatar Section */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
          <img
            src={info.avatarUrl}
            alt={info.roleLabel}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center bg-gray-50">
            {info.fallbackIcon}
          </div>
        </div>
        {/* Role Badge */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-white shadow-sm whitespace-nowrap bg-${info.themeColor}-50 text-${info.themeColor}-600`}
        >
          {info.roleLabel}
        </div>
      </div>

      {/* 2. Text Content */}
      <div className="flex-1 text-left">
        <span
          className={`block text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isSelected ? "text-[#1b1c23]" : "text-gray-400"}`}
        >
          {isSelected ? "You Voted For" : "Opponent"}
        </span>
        <h3
          className={`text-lg font-extrabold leading-tight ${isSelected ? "text-[#1b1c23]" : "text-gray-700"}`}
        >
          {info.name}
        </h3>
      </div>

      {/* 3. Status Indicator */}
      <div
        className={`
        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
        ${
          isSelected
            ? "bg-[#1b1c23] text-white shadow-md scale-100"
            : "bg-gray-50 text-gray-300 scale-90"
        }
      `}
      >
        {isSelected ? (
          <Key className="w-5 h-5" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
      </div>

      {/* Background Flash for Winner */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#1b1c23]/[0.02] pointer-events-none rounded-[24px]" />
      )}
    </div>
  );
}

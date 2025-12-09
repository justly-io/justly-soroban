"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DisputeCard } from "./DisputeCard";
import { BarChartIcon } from "./icons/Icon";
import { FilterIcon } from "./icons/BadgeIcons";
import styles from "./DisputesList.module.css";
import { Gavel, Eye } from "lucide-react";
import { useSliceContract } from "@/hooks/useSliceContract";

export interface Dispute {
  id: string;
  title: string;
  icon?: string;
  category: string;
  votesCount: number;
  totalVotes: number;
  prize: string;
  userVote?: "approve" | "reject";
  voters: Array<{
    name: string;
    avatar?: string;
    vote: "approve" | "reject";
  }>;
}

// Mock data - in production would come from the contract
const mockDisputes: Dispute[] = [
  {
    id: "1",
    title: "Stellar Community Fund",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
  {
    id: "2",
    title: "Ethereum Fundation",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
  {
    id: "3",
    title: "Lionstar",
    category: "Crowfunding",
    votesCount: 8,
    totalVotes: 10,
    prize: "$5,000",
    userVote: "reject",
    voters: [
      {
        name: "Julio Banegas",
        avatar: "/images/profiles-mockup/profile-1.png",
        vote: "reject",
      },
      {
        name: "Micaela Descotte",
        avatar: "/images/profiles-mockup/profile-2.png",
        vote: "approve",
      },
    ],
  },
];

export const DisputesList: React.FC = () => {
  const router = useRouter();
  const contract = useSliceContract();

  // Initialize as null so buttons are disabled by default until data loads
  const [latestId, setLatestId] = useState<string | null>(null);

  // Fetch the latest dispute ID from the contract
  useEffect(() => {
    const fetchLatest = async () => {
      if (contract) {
        try {
          const count = await contract.disputeCount();
          // Only enable buttons if we actually have disputes (> 0)
          if (Number(count) > 0) {
            setLatestId(count.toString());
          } else {
            setLatestId(null);
          }
        } catch (error) {
          console.error("Failed to fetch dispute count", error);
          setLatestId(null);
        }
      }
    };
    void fetchLatest();
  }, [contract]);

  const handleJusticeClick = () => {
    router.push("/category-amount");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.icon}>
            <BarChartIcon />
          </div>
          <h2 className={styles.title}>My disputes:</h2>
        </div>

        {/* Action Buttons Container */}
        <div className="flex items-center gap-2">
          {/* Vote Button */}
          <button
            onClick={() => latestId && router.push(`/vote/${latestId}`)}
            disabled={!latestId}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              latestId
                ? "bg-blue-50 border-blue-100 hover:bg-blue-100 cursor-pointer"
                : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
            }`}
            title={
              latestId
                ? `Vote on Dispute #${latestId}`
                : "No disputes available"
            }
          >
            <Gavel
              className={`w-4 h-4 ${latestId ? "text-blue-600" : "text-gray-400"}`}
            />
          </button>

          {/* Reveal Button */}
          <button
            onClick={() => latestId && router.push(`/reveal/${latestId}`)}
            disabled={!latestId}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              latestId
                ? "bg-purple-50 border-purple-100 hover:bg-purple-100 cursor-pointer"
                : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
            }`}
            title={
              latestId
                ? `Reveal Vote for Dispute #${latestId}`
                : "No disputes available"
            }
          >
            <Eye
              className={`w-4 h-4 ${latestId ? "text-purple-600" : "text-gray-400"}`}
            />
          </button>

          <button className={styles.filterButton}>
            <span>Filter</span>
            <FilterIcon size={12} />
          </button>
        </div>
      </div>

      <div className={styles.disputesContainer}>
        {mockDisputes.map((dispute) => (
          <DisputeCard key={dispute.id} dispute={dispute} />
        ))}
      </div>

      <button className={styles.justiceButton} onClick={handleJusticeClick}>
        Make Justice
      </button>
    </div>
  );
};

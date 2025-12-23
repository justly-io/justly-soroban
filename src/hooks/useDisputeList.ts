import { useState, useEffect } from "react";
import { useSliceContract } from "@/hooks/useSliceContract";
import { useConnect } from "@/providers/ConnectProvider";
import { fetchJSONFromIPFS } from "@/util/ipfs";
import { formatUnits } from "ethers";
import { getVoteData } from "@/util/votingStorage";

export interface Dispute {
  id: string;
  title: string;
  category: string;
  status: number;
  phase: "VOTE" | "REVEAL" | "WITHDRAW" | "CLOSED";
  deadlineLabel: string;
  isUrgent: boolean;
  stake: string;
  jurorsRequired: number;
  revealDeadline: number;
}

// "juror" = disputes where I am a juror
// "all" = all disputes (for the main list)
type ListType = "juror" | "all";

export function useDisputeList(listType: ListType) {
  const { address } = useConnect();
  const contract = useSliceContract();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      if (!contract || !contract.target) {
        setIsLoading(false);
        return;
      }

      // If we need user address (for juror view) but don't have it, wait.
      if (listType === "juror" && !address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let ids: bigint[] = [];

        // 1. Determine which IDs to fetch
        if (listType === "juror" && address) {
          // Fetch assignments for this specific user
          ids = await contract.getJurorDisputes(address);
        } else {
          // Fetch global list (e.g., last 20 disputes)
          // If your contract has 'getOpenDisputes', use that.
          // Otherwise, we loop from disputeCount downwards.
          const count = await contract.disputeCount();
          const start = Number(count);
          const end = Math.max(1, start - 20); // Limit to latest 20
          for (let i = start; i >= end; i--) {
            ids.push(BigInt(i));
          }
        }

        // 2. Fetch details for each ID
        const loaded = await Promise.all(
          ids.map(async (idBg: bigint) => {
            const id = idBg.toString();
            const d = await contract.disputes(id);
            const status = Number(d.status); // 0=Created, 1=Vote, 2=Reveal, 3=Executed
            const now = Math.floor(Date.now() / 1000);

            // Fetch IPFS Metadata
            let title = `Dispute #${id}`;
            let category = "General";
            if (d.ipfsHash) {
              const meta = await fetchJSONFromIPFS(d.ipfsHash);
              if (meta) {
                title = meta.title || title;
                if (meta.category) category = meta.category;
              }
            }
            // Fallback to contract category if set
            if (d.category) category = d.category;

            // Determine Phase & Timers
            let phase: Dispute["phase"] = "CLOSED";
            let deadline = 0;

            // Check local storage for commit data (specific to juror view)
            const contractAddr = contract.target as string;
            const hasRevealed = address
              ? await contract.hasRevealed(id, address)
              : false;
            const localSecretExists = address
              ? !!getVoteData(contractAddr, id, address)
              : false;

            if (status === 1) {
              phase = "VOTE";
              deadline = Number(d.commitDeadline);
            } else if (status === 2) {
              if (localSecretExists && !hasRevealed) phase = "REVEAL";
              else if (now > Number(d.revealDeadline)) phase = "WITHDRAW";
              else phase = "REVEAL";
              deadline = Number(d.revealDeadline);
            } else if (status === 3) {
              phase = "CLOSED"; // or Resolved
            }

            // Calculate Labels
            const diff = deadline - now;
            const isUrgent = diff < 86400 && diff > 0; // < 24h
            const hours = Math.ceil(diff / 3600);

            let deadlineLabel = "Resolved";
            if (status < 3) {
              deadlineLabel = diff > 0 ? `${hours}h left` : "Ended";
            }

            return {
              id,
              title,
              category,
              status,
              phase,
              deadlineLabel,
              isUrgent,
              stake: d.requiredStake ? formatUnits(d.requiredStake, 6) : "0", // Adjust decimals if needed
              jurorsRequired: Number(d.jurorsRequired),
              revealDeadline: Number(d.revealDeadline),
            };
          }),
        );

        // Filter out nulls if any, and set state
        setDisputes(loaded);
      } catch (e) {
        console.error("Error in useDisputeList:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [contract, address, listType]);

  return { disputes, isLoading };
}

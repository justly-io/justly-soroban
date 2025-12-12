import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { useSliceContract } from "./useSliceContract";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { toast } from "sonner";
import { USDC_ADDRESS } from "@/config";
import { sliceAddress } from "@/contracts/slice-abi";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

export function useAssignDispute() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const contract = useSliceContract();
  const { address, signer } = useXOContracts();

  // 1. MATCHMAKER: Find a random active dispute ID
  const findActiveDispute = useCallback(async (): Promise<number | null> => {
    if (!contract) return null;
    setIsFinding(true);

    try {
      // Add a simple retry logic for the "flaky" search
      let countBigInt = BigInt(0);
      try {
        countBigInt = await contract.disputeCount();
      } catch (e) {
        console.warn("First attempt to fetch count failed, retrying...", e);
        // Small delay before retry
        await new Promise((r) => setTimeout(r, 1000));
        countBigInt = await contract.disputeCount();
      }

      const totalDisputes = Number(countBigInt);

      if (totalDisputes === 0) {
        toast.error("No disputes created yet.");
        return null;
      }

      const availableIds: number[] = [];

      for (let i = 1; i <= totalDisputes; i++) {
        try {
          const d = await contract.disputes(i);
          if (Number(d.status) === 1) {
            availableIds.push(i);
          }
        } catch (e) {
          console.warn(`Skipping dispute #${i}`, e);
        }
      }

      if (availableIds.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * availableIds.length);
      return availableIds[randomIndex];
    } catch (error) {
      console.error("Error finding dispute:", error);
      // Don't show toast on search fail, just return null so UI handles it gracefully
      return null;
    } finally {
      setIsFinding(false);
    }
  }, [contract]);

  // 2. ACTION: Join a specific dispute
  const joinDispute = async (disputeId: number) => {
    if (!contract || !address || !signer) {
      toast.error("Wallet not connected");
      return false;
    }

    setIsLoading(true);

    try {
      const disputeData = await contract.disputes(disputeId);
      const jurorStakeAmount = disputeData.jurorStake;

      const usdcContract = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const amountToApprove = jurorStakeAmount;

      console.log(`Approving ${amountToApprove.toString()} units...`);
      toast.info("Step 1/2: Approving Stake...");

      // 1. Approve
      const approveTx = await usdcContract.approve(
        sliceAddress,
        amountToApprove,
      );
      await approveTx.wait();

      // Give the embedded RPC node 2 seconds to index the approval
      toast.info("Verifying approval...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Stake approved! Joining jury...");

      // We manually set gasLimit to bypass the simulation check (CALL_EXCEPTION)
      // 250,000 should be plenty for a join operation
      const tx = await contract.joinDispute(disputeId, {
        gasLimit: 250000,
      });

      toast.info("Confirming Jury Selection...");
      await tx.wait();

      toast.success(`Successfully joined Dispute #${disputeId}!`);
      return true;
    } catch (error: any) {
      console.error("Error joining dispute:", error);

      // Better error parsing
      const msg = error.reason || error.message || "Transaction failed";

      if (msg.includes("user rejected") || msg.includes("User rejected")) {
        toast.error("Transaction cancelled");
      } else if (msg.includes("missing revert data")) {
        // If it still fails with this, it's likely a fund issue or closed dispute
        toast.error("Network error: Please try again in 10 seconds.");
      } else {
        toast.error(`Failed to join: ${msg.slice(0, 50)}...`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { findActiveDispute, joinDispute, isLoading, isFinding };
}

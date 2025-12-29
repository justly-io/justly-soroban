import React, { useState } from "react";
import { Hash, KeyRound, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useSignMessage } from "wagmi";
import {
  calculateCommitment,
  deriveSaltFromSignature,
  getSaltGenerationMessage,
} from "@/util/votingUtils";

export const CryptoToolsCard = () => {
  const { signMessageAsync } = useSignMessage();

  const [disputeId, setDisputeId] = useState("1");
  const [toolSalt, setToolSalt] = useState("");
  const [toolHash, setToolHash] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const toolVote = 1; // Keeping default vote as 1 (Claimant) for testing

  // 1. New Flow: Sign Message -> Derive Salt
  const handleDeriveSalt = async () => {
    try {
      setIsSigning(true);
      const message = getSaltGenerationMessage(disputeId);
      const signature = await signMessageAsync({ message });
      const derivedSalt = deriveSaltFromSignature(signature);

      setToolSalt(derivedSalt.toString());
      toast.success("Salt derived from wallet signature!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to sign message");
    } finally {
      setIsSigning(false);
    }
  };

  // 2. Calculate Hash (Commitment)
  const handleCalculateHash = () => {
    if (!toolSalt) {
      toast.error("Please enter or derive a salt first");
      return;
    }
    try {
      const h = calculateCommitment(toolVote, BigInt(toolSalt));
      setToolHash(h);
    } catch (_e) {
      toast.error("Invalid salt format");
    }
  };

  return (
    <div className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="font-bold text-sm text-[#1b1c23] flex items-center gap-2">
        <Hash className="w-4 h-4 text-[#8c8fff]" /> Crypto Tools
      </h3>

      {/* Section A: Generate Salt */}
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          Step 1: Derive Salt
        </span>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="ID"
            value={disputeId}
            onChange={(e) => setDisputeId(e.target.value)}
            className="w-16 bg-white rounded-lg p-2 text-xs font-bold border border-gray-200 outline-none focus:border-[#8c8fff]"
          />
          <button
            onClick={handleDeriveSalt}
            disabled={isSigning}
            className="flex-1 bg-[#1b1c23] text-white rounded-lg px-3 py-2 text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSigning ? (
              "Signing..."
            ) : (
              <>
                {" "}
                <KeyRound className="w-3 h-3" /> Sign & Derive Salt{" "}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section B: Calculate Hash */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">
          Step 2: Calculate Commit
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Salt (BigInt)"
            value={toolSalt}
            onChange={(e) => setToolSalt(e.target.value)}
            className="flex-1 bg-[#f5f6f9] rounded-lg p-2 text-xs font-mono border-transparent border focus:border-[#8c8fff] outline-none transition-colors"
          />
          <button
            onClick={handleCalculateHash}
            className="px-3 bg-gray-100 rounded-lg text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-1"
          >
            <Calculator className="w-3 h-3" />
            Calc (Vote=1)
          </button>
        </div>
      </div>

      {toolHash && (
        <div className="p-3 bg-gray-900 rounded-lg text-[9px] font-mono text-white break-all border border-gray-700 animate-in fade-in">
          <span className="text-gray-500 select-none block mb-1 font-bold">
            COMMITMENT HASH:
          </span>
          {toolHash}
        </div>
      )}
    </div>
  );
};

import { useGetDispute } from "@/hooks/useGetDispute";

export type EvidenceRole = "claimant" | "defendant";

export function useEvidence(disputeId: string, role: EvidenceRole) {
  const { dispute } = useGetDispute(disputeId);
  const isClaimant = role === "claimant";

  // 1. Dynamic Party Info
  // Select the correct name based on the role
  const realName = isClaimant
    ? dispute?.claimerName || dispute?.claimer
    : dispute?.defenderName || dispute?.defender;

  const partyInfo = {
    name: realName || "Loading...",
    // Use the specific profile images requested
    avatar: isClaimant
      ? "/images/profiles-mockup/profile-1.jpg"
      : "/images/profiles-mockup/profile-2.jpg",
    role: isClaimant ? "Claimant" : "Defendant",
  };

  // 2. Statement Logic
  // Claimant gets the Description. Defendant gets a placeholder.
  const statement = isClaimant
    ? dispute?.description || "No statement provided."
    : "The defendant has not submitted a counter-statement on-chain.";

  // 3. Evidence Routing
  // ONLY show evidence if the role is Claimant.
  const showEvidence = isClaimant;

  const rawCarousel = showEvidence ? dispute?.carouselEvidence || [] : [];
  const rawAudio = showEvidence ? dispute?.audioEvidence : null;

  // Process Images
  const imageEvidence = rawCarousel.map((url: string, i: number) => ({
    id: `img-${i}`,
    type: "image" as const,
    url,
    description: `Exhibit ${i + 1}`,
    uploadDate: "Attached to dispute",
  }));

  // Process Audio
  const audioEvidence = rawAudio
    ? {
        id: "audio-main",
        title: `${partyInfo.role}'s Statement`,
        duration: "Play Audio",
        url: rawAudio,
      }
    : null;

  // Video placeholder (empty for now unless you add video uploads)
  const videoEvidence: any[] = [];

  return {
    dispute,
    partyInfo,
    statement,
    imageEvidence,
    videoEvidence,
    audioEvidence,
  };
}

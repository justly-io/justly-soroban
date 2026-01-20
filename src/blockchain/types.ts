import { ReactNode } from "react";

/**
 * Abstract blockchain account representation
 */
export interface BlockchainAccount {
  address: string | undefined;
  isConnected: boolean;
  chainId?: number | string;
  userId?: string;
  status?: string;
  isReady?: boolean;
}

/**
 * Abstract balance representation
 */
export interface BlockchainBalance {
  balance: bigint;
  isLoading: boolean;
  error?: Error;
}

/**
 * Abstract contract information
 */
export interface BlockchainContracts {
  sliceContract: `0x${string}`;
  usdcToken: `0x${string}`;
  chainId: number;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

/**
 * Dispute creation parameters (blockchain agnostic)
 */
export interface CreateDisputeParams {
  defenderAddress: string;
  claimerAddress: string | undefined;
  category: string;
  disputeData: {
    title: string;
    description: string;
    evidence?: string[];
  };
  jurorsRequired?: number;
  deadlineHours?: number;
}

/**
 * Dispute data structure
 */
export interface DisputeData {
  id: string | bigint;
  claimer: string;
  defender: string;
  category: string;
  status: number | string;
  ruling?: number;
  // Add more fields as needed
}

/**
 * Voting parameters
 */
export interface VoteParams {
  disputeId: string | bigint;
  vote: number;
  salt: string;
}

/**
 * Reveal parameters
 */
export interface RevealParams {
  disputeId: string | bigint;
  vote: number;
  salt: string;
}

/**
 * Hook interfaces for blockchain operations
 */
export interface BlockchainHooks {
  // Core hooks
  useAccount: () => BlockchainAccount;
  useBalance: () => BlockchainBalance;
  useContracts: () => BlockchainContracts;
  useConnect: () => any;
  
  // Action hooks
  useCreateDispute: () => {
    createDispute: (...args: any[]) => Promise<boolean>;
    isCreating: boolean;
  };
  usePayDispute: () => {
    payDispute: (disputeId: any) => Promise<boolean>;
    isPaying: boolean;
  };
  useExecuteRuling: () => {
    executeRuling: (disputeId: any) => Promise<boolean>;
    isExecuting: boolean;
  };
  useAssignDispute: () => {
    assignDispute: (disputeId: any) => Promise<boolean>;
    isAssigning: boolean;
  };
  useSendFunds: () => {
    sendFunds: (to: string, amount: bigint) => Promise<boolean>;
    isSending: boolean;
  };
  useWithdraw: () => {
    withdraw: (amount: bigint) => Promise<boolean>;
    isWithdrawing: boolean;
  };
  useFaucet?: () => {
    requestTokens: () => Promise<boolean>;
    isRequesting: boolean;
  };
  
  // Voting hooks
  useVote: () => {
    vote: (params: VoteParams) => Promise<boolean>;
    isVoting: boolean;
  };
  useReveal: () => {
    reveal: (params: RevealParams) => Promise<boolean>;
    isRevealing: boolean;
  };
  useSliceVoting: () => any;
  useJurorStats: (address?: string) => any;
  
  // Dispute query hooks
  useGetDispute: (disputeId: any) => any;
  useDisputeList: () => any;
  useMyDisputes: () => any;
  useAllDisputes: () => any;
  
  // User hooks
  useUserProfile: (address?: string) => any;
  useStakingToken: () => any;
  useTokenBalance: () => BlockchainBalance;
}

/**
 * Provider props for blockchain plugins
 */
export interface BlockchainProviderProps {
  children: ReactNode;
  initialState?: any;
}

/**
 * Main plugin interface
 */
export interface BlockchainPlugin {
  name: string;
  
  /**
   * Initialize the plugin (setup, config loading, etc.)
   */
  initialize: () => Promise<void>;
  
  /**
   * Get the provider component for this blockchain
   */
  getProviderComponent: () => React.ComponentType<BlockchainProviderProps>;
  
  /**
   * All hooks exposed by this plugin
   */
  hooks: BlockchainHooks;
  
  /**
   * Optional: get configuration specific to this blockchain
   */
  getConfig?: () => Record<string, any>;
}

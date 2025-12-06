const mockTx = {
  signAndSend: async ({ signTransaction: _signTransaction }: { signTransaction: any }) => {
    return {
      result: {
        unwrap: () => BigInt(123) // Mock dispute ID or result
      }
    };
  }
};

const slice = {
  options: {
    publicKey: undefined as string | undefined,
  },
  add_category: async (_args: any) => mockTx,
  create_dispute: async (_args: any) => mockTx,
  pay_dispute: async (_args: any) => mockTx,
  execute: async (_args: any) => mockTx,
  vote: async (_args: any) => mockTx,
  reveal: async (_args: any) => mockTx,
  join_court: async (_args: any) => mockTx,
  claim: async (_args: any) => mockTx,
  get_dispute: async (_args: any) => ({
    result: {
      unwrap: () => ({
        id: BigInt(123),
        claimer: "G...",
        defender: "G...",
        status: 0,
        category: "General",
        jurors_required: 5,
        deadline_pay_seconds: BigInt(0),
        deadline_commit_seconds: BigInt(0),
        deadline_reveal_seconds: BigInt(0),
        assigned_jurors: [],
      })
    }
  }),
};

export default slice;

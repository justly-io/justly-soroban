#[soroban_sdk::contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    ErrUnauthorized = 1,
    ErrInvalidInput = 2,
    ErrInvalidAmount = 3,
    ErrAlreadyPaid = 4,
    ErrNotFound = 5,
    ErrAlreadyBound = 6,
    ErrRemoteAlreadyUsed = 7,
    ErrRulingAlreadySet = 8,
    ErrRulingMissing = 9,
    ErrAlreadyExecuted = 10,
    ErrConfigMissing = 11,
    ErrRemoteMissing = 12,
}

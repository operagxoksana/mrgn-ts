import {
  ActionMessageUIType,
  ActionMessageType,
  canBeBorrowed,
  canBeLent,
  canBeRepaidCollat,
  canBeRepaid,
  canBeWithdrawn,
  canBeLooped,
  DYNAMIC_SIMULATION_ERRORS,
  LstData,
} from ".";
import { ActionType, ExtendedBankInfo } from "@mrgnlabs/marginfi-v2-ui-state";
import { MarginfiAccountWrapper } from "@mrgnlabs/marginfi-client-v2";
import { QuoteResponse } from "@jup-ag/api";
import { WalletToken } from "@mrgnlabs/mrgn-common";

export function getColorForActionMessageUIType(type?: ActionMessageUIType) {
  if (type === "INFO") {
    return "info";
  } else if (type === "WARNING") {
    return "alert";
  } else {
    return "alert";
  }
}

interface CheckActionAvailableProps {
  amount: number | null;
  connected: boolean;
  selectedBank: ExtendedBankInfo | null;
  selectedSecondaryBank: ExtendedBankInfo | null;
  actionQuote: QuoteResponse | null;
}

interface CheckLendActionAvailableProps {
  amount: number | null;
  connected: boolean;
  nativeSolBalance: number;
  showCloseBalance?: boolean;
  selectedBank: ExtendedBankInfo | null;
  banks: ExtendedBankInfo[];
  marginfiAccount: MarginfiAccountWrapper | null;
  lendMode: ActionType;
}

export function checkLendActionAvailable({
  amount,
  nativeSolBalance,
  connected,
  showCloseBalance,
  selectedBank,
  banks,
  marginfiAccount,
  lendMode,
}: CheckLendActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, selectedBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0, showCloseBalance);
  if (generalChecks) checks.push(...generalChecks);

  // allert checks
  if (selectedBank) {
    switch (lendMode) {
      case ActionType.Deposit:
        const lentChecks = canBeLent(selectedBank, nativeSolBalance);
        if (lentChecks.length) checks.push(...lentChecks);
        break;
      case ActionType.Withdraw:
        const withdrawChecks = canBeWithdrawn(selectedBank, marginfiAccount);
        if (withdrawChecks.length) checks.push(...withdrawChecks);
        break;
      case ActionType.Borrow:
        const borrowChecks = canBeBorrowed(selectedBank, banks, marginfiAccount);
        if (borrowChecks.length) checks.push(...borrowChecks);
        break;
      case ActionType.Repay:
        const repayChecks = canBeRepaid(selectedBank);
        if (repayChecks) checks.push(...repayChecks);
        break;
    }
  }

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

interface CheckLoopActionAvailableProps {
  amount: number | null;
  connected: boolean;
  selectedBank: ExtendedBankInfo | null;
  selectedSecondaryBank: ExtendedBankInfo | null;
  actionQuote: QuoteResponse | null;
}

export function checkLoopActionAvailable({
  amount,
  connected,
  selectedBank,
  selectedSecondaryBank,
  actionQuote,
}: CheckLoopActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, selectedBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0);
  if (generalChecks) checks.push(...generalChecks);

  // allert checks
  if (selectedBank) {
    const loopChecks = canBeLooped(selectedBank, selectedSecondaryBank, actionQuote);
    if (loopChecks.length) checks.push(...loopChecks);
  }

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

export function checkRepayCollatActionAvailable({
  amount,
  connected,
  selectedBank,
  selectedSecondaryBank,
  actionQuote,
}: CheckActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, selectedBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0);
  if (generalChecks) checks.push(...generalChecks);

  // allert checks
  // if (selectedBank) {
  //   const repayChecks = canBeRepaidCollat(selectedBank, selectedSecondaryBank, [], actionQuote);
  //   if (repayChecks) checks.push(...repayChecks);
  // } // TODO: update & fix

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

export function checkRepayActionAvailable({
  amount,
  connected,
  selectedBank,
  selectedSecondaryBank,
  actionQuote,
}: CheckActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, selectedBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0);
  if (generalChecks) checks.push(...generalChecks);

  let repayChecks: ActionMessageType[] = [];
  if (
    selectedBank &&
    selectedSecondaryBank &&
    selectedBank.address.toString().toLowerCase() === selectedSecondaryBank.address.toString().toLowerCase()
  ) {
    repayChecks = canBeRepaid(selectedBank, true);
  } else if (selectedBank && selectedSecondaryBank) {
    repayChecks = canBeRepaidCollat(selectedBank, selectedSecondaryBank, [], actionQuote);
  }
  if (repayChecks) checks.push(...repayChecks);

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

function getRequiredCheck(connected: boolean, selectedBank: ExtendedBankInfo | null): ActionMessageType | null {
  if (!connected) {
    return { isEnabled: false };
  }
  if (!selectedBank) {
    return { isEnabled: false };
  }

  return null;
}

function getGeneralChecks(amount: number = 0, showCloseBalance?: boolean): ActionMessageType[] {
  let checks: ActionMessageType[] = [];
  if (showCloseBalance) {
    checks.push({ actionMethod: "INFO", description: "Close lending balance.", isEnabled: true });
  } // TODO: only for lend and withdraw

  if (amount === 0) {
    checks.push({ isEnabled: false });
  }

  return checks;
}

interface CheckStakeActionAvailableProps {
  amount: number | null;
  connected: boolean;
  selectedBank: ExtendedBankInfo | null;
  actionQuote: QuoteResponse | null;
  lstData: LstData | null;
}

export function checkStakeActionAvailable({
  amount,
  connected,
  selectedBank,
  actionQuote,
  lstData,
}: CheckStakeActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, selectedBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0);
  if (generalChecks) checks.push(...generalChecks);

  if (selectedBank?.meta.tokenSymbol !== "SOL" && !actionQuote) checks.push({ isEnabled: false });

  if (actionQuote?.priceImpactPct && Number(actionQuote.priceImpactPct) > 0.01) {
    if (actionQuote?.priceImpactPct && Number(actionQuote.priceImpactPct) > 0.05) {
      checks.push(DYNAMIC_SIMULATION_ERRORS.PRICE_IMPACT_ERROR_CHECK(Number(actionQuote.priceImpactPct)));
    } else {
      checks.push(DYNAMIC_SIMULATION_ERRORS.PRICE_IMPACT_WARNING_CHECK(Number(actionQuote.priceImpactPct)));
    }
  }

  if (lstData && lstData?.updateRequired)
    checks.push({
      isEnabled: false,
      description: "Epoch change detected - staking available again shortly",
    });

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

interface CheckDepositSwapActionAvailableProps {
  amount: number | null;
  connected: boolean;
  nativeSolBalance: number;
  showCloseBalance?: boolean;
  depositBank: ExtendedBankInfo | null;
  swapBank: ExtendedBankInfo | WalletToken | null;
  banks: ExtendedBankInfo[];
  marginfiAccount: MarginfiAccountWrapper | null;
  lendMode: ActionType;
}

export function checkDepositSwapActionAvailable({
  amount,
  nativeSolBalance,
  connected,
  showCloseBalance,
  depositBank,
  swapBank,
  banks,
  marginfiAccount,
  lendMode,
}: CheckDepositSwapActionAvailableProps): ActionMessageType[] {
  let checks: ActionMessageType[] = [];

  const requiredCheck = getRequiredCheck(connected, depositBank);
  if (requiredCheck) return [requiredCheck];

  const generalChecks = getGeneralChecks(amount ?? 0, showCloseBalance);
  if (generalChecks) checks.push(...generalChecks);

  // alert checks
  if (depositBank) {
    const depositChecks = canBeLent(depositBank, nativeSolBalance);
    if (depositChecks.length) checks.push(...depositChecks);
  }

  if (!swapBank) {
    checks.push({ isEnabled: false });
  }

  if (checks.length === 0)
    checks.push({
      isEnabled: true,
    });

  return checks;
}

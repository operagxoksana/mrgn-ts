import React from "react";

import { ActionType, ExtendedBankInfo } from "@mrgnlabs/marginfi-v2-ui-state";
import { dynamicNumeralFormatter, WalletToken } from "@mrgnlabs/mrgn-common";

type DepositSwapActionProps = {
  walletAmount: number | undefined;
  maxAmount: number;
  showLendingHeader?: boolean;
  lendMode: ActionType;
  selectedBank: ExtendedBankInfo | WalletToken | null;

  onSetAmountRaw: (amount: string) => void;
};

export const DepositSwapAction = ({
  maxAmount,
  walletAmount,
  onSetAmountRaw,
  selectedBank,
  lendMode,
}: DepositSwapActionProps) => {
  const numberFormater = React.useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 }), []);

  const maxLabel = React.useMemo((): {
    amount: string;
    showWalletIcon?: boolean;
    label?: string;
  } => {
    if (!selectedBank) {
      return {
        amount: "-",
        showWalletIcon: false,
      };
    }

    const formatAmount = (amount?: number, symbol?: string) =>
      amount !== undefined ? `${dynamicNumeralFormatter(amount)} ${symbol}` : "-";

    if ("info" in selectedBank) {
      switch (lendMode) {
        case ActionType.Deposit:
          return {
            label: "Wallet: ",
            amount: formatAmount(walletAmount, selectedBank?.meta.tokenSymbol),
          };
        case ActionType.Borrow:
          return {
            label: "Max Borrow: ",
            amount: formatAmount(selectedBank.userInfo.maxBorrow, selectedBank?.meta.tokenSymbol),
          };

        case ActionType.Withdraw:
          return {
            amount: formatAmount(
              selectedBank?.isActive ? selectedBank.position.amount : undefined,
              selectedBank?.meta.tokenSymbol
            ),
            label: "Supplied: ",
          };

        case ActionType.Repay:
          return {
            amount: formatAmount(
              selectedBank?.isActive ? selectedBank.position.amount : undefined,
              selectedBank?.meta.tokenSymbol
            ),
            label: "Borrowed: ",
          };

        default:
          return { amount: "-" };
      }
    } else {
      return {
        label: "Wallet: ",
        amount: formatAmount(walletAmount, selectedBank?.symbol),
      };
    }
  }, [selectedBank, lendMode, walletAmount]);

  // const isMaxButtonVisible = React.useMemo(() => lendMode === ActionType.Repay, [lendMode]);

  // Section above the input
  return (
    <>
      {selectedBank && (
        <ul className="flex flex-col gap-0.5 mt-4 text-xs w-full text-muted-foreground">
          <li className="flex justify-between items-center gap-1.5">
            <strong className="mr-auto">{maxLabel.label}</strong>
            <div className="flex space-x-1">
              {/* {selectedBank?.isActive && <div>{clampedNumeralFormatter(selectedBank.position.amount)}</div>}
              {selectedBank?.isActive && <IconArrowRight width={12} height={12} />} */}
              <div>{maxLabel.amount}</div>

              <button
                className="cursor-pointer border-b border-transparent transition text-mfi-action-box-highlight hover:border-mfi-action-box-highlight"
                disabled={maxAmount === 0}
                onClick={() => onSetAmountRaw(numberFormater.format(maxAmount))}
              >
                MAX
              </button>
            </div>
          </li>
        </ul>
      )}
    </>
  );
};

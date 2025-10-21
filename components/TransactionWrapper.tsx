/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
} from "@coinbase/onchainkit/transaction";

interface TransactionWrapperProps {
  calls: any[];
  onStatus?: (status: LifecycleStatus) => void;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function TransactionWrapper({
  calls,
  onStatus,
  disabled = false,
}: TransactionWrapperProps) {
  if (disabled || calls.length === 0) {
    return (
      <button
        disabled
        className="transaction-button"
        style={{
          opacity: 0.8,
          cursor: "not-allowed",
        }}
      >
        Invalid fields
      </button>
    );
  }

  return (
    <Transaction chainId={8453} calls={calls} onStatus={onStatus}>
      <div>
        {/* @ts-ignore */}
        <TransactionButton
          render={({ status, onSubmit, isDisabled }) => (
            <button
              onClick={onSubmit}
              disabled={isDisabled}
              className="transaction-button"
            >
              {status === "pending"
                ? "Processing..."
                : status === "success"
                ? "View transaction"
                : "Send at light speed"}
            </button>
          )}
        />
        <TransactionSponsor />
      </div>
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
      <TransactionToast>
        <TransactionToastIcon />
        <TransactionToastLabel />
        <TransactionToastAction />
      </TransactionToast>
    </Transaction>
  );
}

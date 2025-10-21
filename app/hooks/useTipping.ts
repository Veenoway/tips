/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useTipping.ts
"use client";

import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Address, encodeFunctionData, formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useBalance, useReadContract } from "wagmi";

// USDC sur Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;

// Platform fee wallet (remplace par ta vraie adresse)
const PLATFORM_FEE_WALLET =
  "0x77A89C51f106D6cD547542a3A83FE73cB4459135" as Address;

export function useTipping() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Balance ETH
  const { data: ethBalanceData } = useBalance({
    address,
    chainId: baseSepolia.id,
  });

  // Balance USDC
  const { data: usdcBalanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const ethBalance = ethBalanceData ? formatEther(ethBalanceData.value) : "0";

  const usdcBalance = usdcBalanceData
    ? formatEther(usdcBalanceData as bigint)
    : "0";

  const calculateFee = useCallback((amount: number, feePercent: number = 2) => {
    const fee = (amount * feePercent) / 100;
    const recipientGets = amount - fee;
    return { fee, recipientGets };
  }, []);

  const buildEthTipCalls = useCallback(
    (recipient: string, amountETH: number) => {
      if (!recipient) {
        return null;
      }

      if (amountETH <= 0) {
        return null;
      }

      if (Number(ethBalance) < amountETH) {
        return null;
      }

      // Minimum 0.0001 ETH
      if (amountETH < 0.0001) {
        return null;
      }

      return {
        to: recipient as Address,
        value: parseEther(amountETH.toString()),
        data: "0x" as `0x${string}`,
      };
    },
    [ethBalance]
  );

  const buildUsdcTipCalls = useCallback(
    (recipient: Address, amountUSD: number, feePercent: number = 2) => {
      const { fee, recipientGets } = calculateFee(amountUSD, feePercent);

      const calls = [];

      // Call 1: Transfer USDC au recipient
      calls.push({
        to: USDC_ADDRESS,
        data: encodeFunctionData({
          abi: [
            {
              inputs: [
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "transfer",
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "transfer",
          args: [recipient, parseEther(recipientGets.toString())],
        }),
      });

      // Call 2: Transfer fee USDC à la plateforme
      if (fee > 0) {
        calls.push({
          to: USDC_ADDRESS,
          data: encodeFunctionData({
            abi: [
              {
                inputs: [
                  { name: "to", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "transfer",
            args: [PLATFORM_FEE_WALLET, parseEther(fee.toString())],
          }),
        });
      }

      return calls;
    },
    [calculateFee]
  );

  // Fonction sendTip simplifiée (retourne les calls pour TransactionButton)
  const sendTip = useCallback(
    (
      recipient: string,
      amount: number,
      currency: "ETH" | "USDC",
      feePercent: number = 2,
      message?: string
    ) => {
      if (!recipient) {
        toast.error("Please enter a recipient address");
        return [];
      }

      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return [];
      }

      // Log du message (tu peux stocker ça on-chain ou off-chain)
      if (message) {
        console.log("Tip message:", message);
        // TODO: Store message in database or emit event
      }

      if (currency === "ETH") {
        return buildEthTipCalls(recipient as Address, amount);
      } else {
        return buildUsdcTipCalls(recipient as Address, amount, feePercent);
      }
    },
    [buildEthTipCalls, buildUsdcTipCalls]
  );

  // Lifecycle handler pour TransactionButton
  const handleLifecycleStatus = useCallback((status: LifecycleStatus) => {
    console.log("Transaction status:", status);

    if (status.statusName === "init") {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
    }

    if (status.statusName === "success") {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Tip sent successfully! ");

      if (status.statusData.transactionReceipts) {
        setTxHash(status.statusData.transactionReceipts[0].transactionHash);
      }
    }

    if (status.statusName === "error") {
      setIsLoading(false);
      setIsSuccess(false);
      setError(
        new Error(
          (status as any).statusData?.errorMessage || "Transaction failed"
        )
      );
      toast.error(
        (status as any).statusData?.errorMessage || "Transaction failed"
      );
    }
  }, []);

  return {
    // Wallet info
    address,
    isConnected,

    // Balances
    ethBalance,
    usdcBalance,

    // Transaction state
    isLoading,
    isSuccess,
    error,
    txHash,

    // Functions
    sendTip,
    calculateFee,
    buildEthTipCalls,
    buildUsdcTipCalls,
    handleLifecycleStatus,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Address, encodeFunctionData, parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../contract";

// Types
export enum Frequency {
  Weekly = 0,
  BiWeekly = 1,
  Monthly = 2,
}

export enum SubscriptionStatus {
  Active = 0,
  Paused = 1,
  Cancelled = 2,
  Insufficient = 3,
}

export interface Subscription {
  subscriber: Address;
  recipient: Address;
  amount: bigint;
  isEth: boolean;
  frequency: Frequency;
  nextPayment: bigint;
  startDate: bigint;
  totalPaid: bigint;
  paymentCount: bigint;
  skippedPayments: bigint;
  status: SubscriptionStatus;
  lastExecutionBlock: bigint;
}

export interface UserDeposits {
  eth: bigint;
  usdc: bigint;
}

interface UseRecurringTipsProps {
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export function useRecurringTips({
  onSuccess,
  onError,
}: UseRecurringTipsProps = {}) {
  const { address, isConnected } = useAccount();

  const [isTransacting, setIsTransacting] = useState(false);

  // ============ READ HOOKS ============

  // User deposits
  const { data: deposits, refetch: refetchDeposits } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getUserDeposits",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // User subscriptions IDs
  const { data: subscriptionIds, refetch: refetchSubscriptionIds } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getUserSubscriptions",
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    });

  // Received subscriptions IDs
  const { data: receivedSubscriptionIds, refetch: refetchReceivedIds } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "getReceivedSubscriptions",
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    });

  // Executable subscriptions
  const { data: executableIds, refetch: refetchExecutable } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getExecutableSubscriptions",
    args: [BigInt(0), BigInt(100)],
  });

  // ============ FETCH SUBSCRIPTIONS DETAILS ============

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [receivedSubscriptions, setReceivedSubscriptions] = useState<
    Subscription[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = async (id: bigint): Promise<Subscription> => {
    // Utiliser useReadContract ou fetch API
    const response = await fetch(`/api/subscription/${id}`);
    return response.json();
  };

  const fetchSubscriptionDetails = useCallback(
    async (ids: readonly bigint[]) => {
      if (!ids || ids.length === 0) return [];
      const promises = ids.map((id) => fetchSubscription(id));
      return Promise.all(promises);
    },
    []
  );

  useEffect(() => {
    if (
      subscriptionIds &&
      Array.isArray(subscriptionIds) &&
      subscriptionIds.length > 0
    ) {
      setLoading(true);
      fetchSubscriptionDetails(subscriptionIds)
        .then(setSubscriptions)
        .finally(() => setLoading(false));
    }
  }, [subscriptionIds, fetchSubscriptionDetails]);

  useEffect(() => {
    if (
      receivedSubscriptionIds &&
      Array.isArray(receivedSubscriptionIds) &&
      receivedSubscriptionIds.length > 0
    ) {
      setLoading(true);
      fetchSubscriptionDetails(receivedSubscriptionIds)
        .then(setReceivedSubscriptions)
        .finally(() => setLoading(false));
    }
  }, [receivedSubscriptionIds, fetchSubscriptionDetails]);

  // ============ TRANSACTION BUILDERS ============

  // Helper pour créer les calls
  const buildCall = (functionName: string, args: any[]) => ({
    to: CONTRACT_ADDRESS as Address,
    data: encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName,
      args,
    }),
  });

  // Deposit ETH
  const buildDepositEthCall = (amount: string) => ({
    to: CONTRACT_ADDRESS as Address,
    value: parseEther(amount),
    data: encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: "depositEth",
    }),
  });

  // Deposit USDC
  const buildDepositUsdcCall = (amount: string) =>
    buildCall("depositUsdc", [parseEther(amount)]);

  // Withdraw ETH
  const buildWithdrawEthCall = (amount: string) =>
    buildCall("withdrawEth", [parseEther(amount)]);

  // Withdraw USDC
  const buildWithdrawUsdcCall = (amount: string) =>
    buildCall("withdrawUsdc", [parseEther(amount)]);

  // Emergency Withdraw
  const buildEmergencyWithdrawCall = () =>
    buildCall("emergencyWithdrawAll", []);

  // Create Subscription ETH
  const buildCreateSubscriptionEthCall = (
    recipient: Address,
    amount: string,
    frequency: Frequency
  ) =>
    buildCall("createSubscriptionEth", [
      recipient,
      parseEther(amount),
      frequency,
    ]);

  // Create Subscription USDC
  const buildCreateSubscriptionUsdcCall = (
    recipient: Address,
    amount: string,
    frequency: Frequency
  ) =>
    buildCall("createSubscriptionUsdc", [
      recipient,
      parseEther(amount),
      frequency,
    ]);

  // Execute Subscription
  const buildExecuteSubscriptionCall = (subId: bigint) =>
    buildCall("executeSubscription", [subId]);

  // Pause Subscription
  const buildPauseSubscriptionCall = (subId: bigint) =>
    buildCall("pauseSubscription", [subId]);

  // Resume Subscription
  const buildResumeSubscriptionCall = (subId: bigint) =>
    buildCall("resumeSubscription", [subId]);

  // Cancel Subscription
  const buildCancelSubscriptionCall = (subId: bigint) =>
    buildCall("cancelSubscription", [subId]);

  // Set User Limits
  const buildSetUserLimitsCall = (
    maxAmountPerPayment: string,
    maxTotalPerMonth: string
  ) =>
    buildCall("setUserLimits", [
      parseEther(maxAmountPerPayment),
      parseEther(maxTotalPerMonth),
    ]);

  // ============ LIFECYCLE HANDLERS ============

  const handleLifecycleStatus = useCallback(
    (status: LifecycleStatus) => {
      console.log("Transaction status:", status);

      if (status.statusName === "init") {
        setIsTransacting(true);
      }

      if (status.statusName === "success") {
        setIsTransacting(false);
        toast.success("Transaction successful!");

        // Refresh data
        refetchDeposits();
        refetchSubscriptionIds();
        refetchReceivedIds();
        refetchExecutable();

        if (onSuccess && status.statusData.transactionReceipts) {
          onSuccess({
            transactionReceipts: status.statusData.transactionReceipts,
          } as any);
        }
      }

      if (status.statusName === "error") {
        setIsTransacting(false);
        toast.error(
          (status as any).statusData.errorMessage || "Transaction failed"
        );

        if (onError && (status as any).error) {
          onError((status as any).error as Error);
        }
      }
    },
    [
      onSuccess,
      onError,
      refetchDeposits,
      refetchSubscriptionIds,
      refetchReceivedIds,
      refetchExecutable,
    ]
  );

  // ============ REFRESH ALL ============

  const refreshAll = useCallback(() => {
    refetchDeposits();
    refetchSubscriptionIds();
    refetchReceivedIds();
    refetchExecutable();
  }, [
    refetchDeposits,
    refetchSubscriptionIds,
    refetchReceivedIds,
    refetchExecutable,
  ]);

  // ============ RETURN ============

  return {
    // Connection
    address,
    isConnected,

    // Deposits
    deposits: {
      eth: (deposits as any[])?.[0] || BigInt(0),
      usdc: (deposits as any[])?.[1] || BigInt(0),
    },

    // Subscriptions
    subscriptions,
    receivedSubscriptions,
    executableIds: executableIds || [],

    // Loading states
    loading,
    isTransacting,

    // Transaction builders (pour utiliser avec TransactionButton)
    buildDepositEthCall,
    buildDepositUsdcCall,
    buildWithdrawEthCall,
    buildWithdrawUsdcCall,
    buildEmergencyWithdrawCall,
    buildCreateSubscriptionEthCall,
    buildCreateSubscriptionUsdcCall,
    buildExecuteSubscriptionCall,
    buildPauseSubscriptionCall,
    buildResumeSubscriptionCall,
    buildCancelSubscriptionCall,
    buildSetUserLimitsCall,

    // Lifecycle handler
    handleLifecycleStatus,

    // Utilities
    refreshAll,
  };
}

// ============ HELPER COMPONENTS ============

// Component wrapper pour les transactions

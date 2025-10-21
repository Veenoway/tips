import { useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";

// ABI simplifié (juste les fonctions nécessaires)
const TIPPING_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "string", name: "_message", type: "string" },
    ],
    name: "tipEth",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "string", name: "_message", type: "string" },
    ],
    name: "tipUsdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "calculateNetAmount",
    outputs: [
      { internalType: "uint256", name: "netAmount", type: "uint256" },
      { internalType: "uint256", name: "feeAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_TIP_AMOUNT_ETH",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Adresse du contrat sur Base
const TIPPING_CONTRACT =
  "0xEA90A921e78ea9B0202681CF33359B04d3D81581" as `0x${string}`;

// USDC sur Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

interface TipParams {
  recipient: string;
  amount: string; // En ETH ou USDC (format humain: "0.01")
  message: string;
  token: "ETH" | "USDC";
}

export function useTipping() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Balance ETH
  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address,
    chainId: base.id,
  });

  // Balance USDC
  const { data: usdcBalance, refetch: refetchUsdc } = useBalance({
    address,
    token: USDC_ADDRESS,
    chainId: base.id,
  });

  // Hook pour écrire dans le contrat
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Attendre la confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Vérifier si l'user a assez de balance
   */
  const checkBalance = (amount: string, token: "ETH" | "USDC"): boolean => {
    if (!isConnected) {
      setError("Wallet not connected");
      return false;
    }

    try {
      const amountBigInt =
        token === "ETH" ? parseEther(amount) : BigInt(parseFloat(amount) * 1e6); // USDC a 6 decimals

      const balance = token === "ETH" ? ethBalance : usdcBalance;

      if (!balance || balance.value < amountBigInt) {
        setError(`Insufficient ${token} balance`);
        return false;
      }

      // Vérifier le minimum (0.0001 ETH)
      if (token === "ETH" && parseFloat(amount) < 0.0001) {
        setError("Minimum tip is 0.0001 ETH");
        return false;
      }

      // Vérifier le minimum (0.1 USDC)
      if (token === "USDC" && parseFloat(amount) < 0.1) {
        setError("Minimum tip is 0.1 USDC");
        return false;
      }

      return true;
    } catch {
      setError("Invalid amount");
      return false;
    }
  };

  /**
   * Calculer les fees (2% par défaut)
   */
  const calculateFee = (amount: string): { net: string; fee: string } => {
    const amountNum = parseFloat(amount);
    const feeAmount = amountNum * 0.02; // 2%
    const netAmount = amountNum - feeAmount;

    return {
      net: netAmount.toFixed(6),
      fee: feeAmount.toFixed(6),
    };
  };

  /**
   * Envoyer un tip en ETH
   */
  const sendTipEth = async ({
    recipient,
    amount,
    message,
  }: Omit<TipParams, "token">) => {
    setError(null);
    setIsLoading(true);

    try {
      // Vérifier la balance
      if (!checkBalance(amount, "ETH")) {
        setIsLoading(false);
        return null;
      }

      // Vérifier que l'adresse est valide
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError("Invalid recipient address");
        setIsLoading(false);
        return null;
      }

      // Envoyer la transaction
      writeContract({
        address: TIPPING_CONTRACT,
        abi: TIPPING_ABI,
        functionName: "tipEth",
        args: [recipient as `0x${string}`, message],
        value: parseEther(amount),
      });

      return hash;
    } catch {
      setError("Transaction failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envoyer un tip en USDC
   */
  const sendTipUsdc = async ({
    recipient,
    amount,
    message,
  }: Omit<TipParams, "token">) => {
    setError(null);
    setIsLoading(true);

    try {
      // Vérifier la balance
      if (!checkBalance(amount, "USDC")) {
        setIsLoading(false);
        return null;
      }

      // Vérifier que l'adresse est valide
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError("Invalid recipient address");
        setIsLoading(false);
        return null;
      }

      // Convertir en format USDC (6 decimals)
      const amountUsdc = BigInt(parseFloat(amount) * 1e6);

      // Envoyer la transaction
      writeContract({
        address: TIPPING_CONTRACT,
        abi: TIPPING_ABI,
        functionName: "tipUsdc",
        args: [recipient as `0x${string}`, amountUsdc, message],
      });

      return hash;
    } catch {
      setError("Transaction failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fonction générique pour envoyer un tip
   */
  const sendTip = async (params: TipParams) => {
    if (params.token === "ETH") {
      return sendTipEth(params);
    } else {
      return sendTipUsdc(params);
    }
  };

  /**
   * Rafraîchir les balances
   */
  const refreshBalances = () => {
    refetchEth();
    refetchUsdc();
  };

  return {
    // État
    isConnected,
    address,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    txHash: hash,

    // Balances
    ethBalance: ethBalance ? formatEther(ethBalance.value) : "0",
    usdcBalance: usdcBalance
      ? (Number(usdcBalance.value) / 1e6).toFixed(2)
      : "0",

    // Fonctions
    sendTip,
    sendTipEth,
    sendTipUsdc,
    checkBalance,
    calculateFee,
    refreshBalances,
  };
}

export { TIPPING_CONTRACT, USDC_ADDRESS };

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useTransaction,
  useWriteContract,
} from "wagmi";

const CONTRACT_ADDRESS =
  "0xaaE580126d5C354bfb006Db5a3e5C23DC4077DF6" as `0x${string}`;

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_baseURI",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_baseURI",
        type: "string",
      },
    ],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useMint() {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    data: txData,
    isLoading: isMining,
    isError: txError,
    isSuccess: isMined,
  } = useTransaction({
    hash: txHash ?? undefined,
  });

  // Lire le total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalSupply",
  });

  // Lire le max supply
  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "MAX_SUPPLY",
  });

  useEffect(() => {
    if (hash) setTxHash(hash);
  }, [hash]);

  // Rafraîchir le total supply après un mint réussi
  useEffect(() => {
    if (isMined) {
      refetchTotalSupply();
    }
  }, [isMined, refetchTotalSupply]);

  const mintNFT = useCallback(() => {
    const mint = async () => {
      if (!isConnected) {
        return;
      }

      try {
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "mint",
        });
      } catch (err) {
        console.error("Erreur de mint:", err);
      }
    };
    return mint();
  }, [isConnected, writeContract]);

  return {
    mintNFT,
    isPending,
    isMining,
    isMined,
    writeError,
    txError,
    txHash,
    txData,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    maxSupply: maxSupply ? Number(maxSupply) : 0,
    remaining:
      maxSupply && totalSupply ? Number(maxSupply) - Number(totalSupply) : 0,
  };
}

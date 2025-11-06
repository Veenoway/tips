"use client";

import { useMint } from "@/hooks/useMint";
import {
  Address,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import styles from "./page.module.css";

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const { mintNFT, isPending, isMining, isMined, writeError, txError, txHash } =
    useMint();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isMined) {
      setShowSuccess(true);
    }
  }, [isMined]);

  const handleMint = async () => {
    await mintNFT();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Wallet Button - Top Right */}
        <div className={styles.walletContainer}>
          <Wallet>
            <ConnectWallet className={styles.connectButton}>
              <Name />
            </ConnectWallet>
            <WalletDropdown className={styles.connectButton}>
              <Identity hasCopyAddressOnClick>
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownBasename />
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>

        {/* Header */}
        <header className={styles.header}></header>

        {/* Main Card */}
        <div className={styles.card}>
          {/* NFT Image */}
          <div className={styles.nftImageContainer}>
            <div className={styles.nftImage}>
              <div className={styles.nftPlaceholder}>
                <img
                  src="https://ipfs.io/ipfs/bafybeiay5svghk2wgdti3q76bg7prmh6z5avostyxkvaa5lopkb4hdwk7e"
                  alt="Basie"
                />
              </div>
            </div>
          </div>

          {/* NFT Info */}
          <div className={styles.nftInfo}>
            <h2 className={styles.nftTitle}>Basie</h2>
            <p className={styles.nftDescription}>
              Basie is a free to mint NFT that will be used to reward users for
              their engagement on Base to get a chance to get rewarded for my
              next project.
            </p>
          </div>
          <div className={styles.divider} />

          {/* Success Message */}
          {showSuccess && (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✓</div>
              <div>
                <h3 className={styles.successTitle}>Minted Successfully! 🎉</h3>
                <p className={styles.successText}>
                  Basie is now in your wallet
                </p>
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.txLink}
                  >
                    View on BaseScan →
                  </a>
                )}
              </div>
            </div>
          )}

          {!showSuccess && (
            <button
              onClick={() => {
                if (isConnected) {
                  handleMint();
                }
              }}
              disabled={isPending || isMining}
              className={styles.mintButton}
            >
              {isPending || isMining ? (
                <span className={styles.loadingContainer}>
                  <svg className={styles.spinner} viewBox="0 0 24 24">
                    <circle
                      className={styles.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className={styles.spinnerPath}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isPending ? "Confirming..." : "Minting..."}
                </span>
              ) : (
                "Mint Basie"
              )}
            </button>
          )}

          {(writeError || txError) && (
            <div className={styles.errorMessage}>
              <p>Error: {writeError?.message || "Transaction failed"}</p>
            </div>
          )}

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>On-chain metadata</span>
            </div>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>ERC-721 standard</span>
            </div>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Deployed on Base</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>Powered by Base</p>
        </footer>
      </div>
    </div>
  );
}

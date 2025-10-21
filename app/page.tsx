"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { useTipping } from "./hooks/useTipping";
import styles from "./page.module.css";

type Currency = "ETH" | "USDC";

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");
  const [amount, setAmount] = useState(10);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const quickAmounts = [5, 10, 25, 50];
  const platformFeePercent = 2;
  const platformFee = (amount * platformFeePercent) / 100;
  const recipientGets = amount - platformFee;

  const ethPrice = 2380;
  const ethAmount = amount / ethPrice;

  const { isFrameReady, setFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const {
    isConnected,
    isLoading,
    isSuccess,
    error,
    ethBalance,
    usdcBalance,
    sendTip,
    calculateFee,
    txHash,
  } = useTipping();

  console.log(
    isConnected,
    isLoading,
    isSuccess,
    error,
    ethBalance,
    usdcBalance,
    sendTip,
    calculateFee,
    txHash
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>TipBase</h1>
          <p className={styles.subtitle}>Fast & Simple Tips on Base</p>
        </header>

        <div className={styles.card}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Send To</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or ENS"
              className={styles.input}
            />
          </div>

          <div className={styles.currencySection}>
            <div className={styles.currencyToggle}>
              {(["ETH", "USDC"] as Currency[]).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`${styles.currencyButton} ${
                    selectedCurrency === currency ? styles.active : ""
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            <div className={styles.amountDisplay}>${amount.toFixed(2)}</div>
            <div className={styles.ethEquivalent}>
              ≈ {ethAmount.toFixed(4)} ETH
            </div>

            {/* Quick Amount Buttons */}
            <div className={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={styles.quickAmountButton}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Message Input */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Message (Optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a nice message..."
              className={styles.input}
            />
          </div>

          {/* Info Rows */}
          <div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Amount</span>
              <span className={styles.infoValue}>${amount.toFixed(2)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                Platform Fee ({platformFeePercent}%)
              </span>
              <span className={styles.infoValue}>
                ${platformFee.toFixed(2)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Recipient Gets</span>
              <span className={styles.infoValue}>
                ${recipientGets.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Send Button */}
          <button className={styles.primaryButton}>Send Tip Now</button>
        </div>

        {/* Balance Card */}
        <div className={styles.card}>
          <label className={styles.label}>Your Balance</label>

          <div className={styles.balanceBox}>
            <div className={styles.balanceRow}>
              <span className={styles.balanceLabel}>ETH</span>
              <span className={styles.balanceValue}>0.124 ETH</span>
            </div>
            <div className={styles.balanceRow}>
              <span className={styles.balanceLabel}>USDC</span>
              <span className={styles.balanceValue}>45.00 USDC</span>
            </div>
          </div>

          <button className={styles.primaryButton}>Withdraw</button>
        </div>

        {/* Stats Card */}
        <div className={styles.card}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1,234</div>
              <div className={styles.statLabel}>Total Tips</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>$42K</div>
              <div className={styles.statLabel}>Volume</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>$840</div>
              <div className={styles.statLabel}>Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

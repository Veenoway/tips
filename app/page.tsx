"use client";

import { TransactionWrapper } from "@/components/TransactionWrapper";
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
import { useEffect, useMemo, useState } from "react";
import { useTipping } from "./hooks/useTipping";
import styles from "./page.module.css";

type Currency = "ETH" | "USDC";

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");
  const [amount, setAmount] = useState(0.0001);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const quickAmounts = [0.0001, 0.001, 0.01, 0.1];
  const platformFeePercent = 0;
  const platformFee = (amount * platformFeePercent) / 100;
  const recipientGets = amount - platformFee;

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
    buildEthTipCalls,
    handleLifecycleStatus,
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

  const calls = useMemo(() => {
    const call = buildEthTipCalls(recipient as `0x${string}`, amount);
    return call ? [call] : [];
  }, [recipient, amount, buildEthTipCalls]);

  console.log("calls", calls);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
          }}
        >
          <Wallet>
            <ConnectWallet>
              <Name />
            </ConnectWallet>
            <WalletDropdown>
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
                  } ${currency === "USDC" ? styles.disabled : ""}`}
                  disabled={currency === "USDC"}
                >
                  {currency}
                </button>
              ))}
            </div>

            <div className={styles.amountDisplay}>{amount}</div>
            {/* <div className={styles.ethEquivalent}>
              ≈ {ethAmount.toFixed(4)} ETH
            </div> */}

            {/* Quick Amount Buttons */}
            <div className={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={styles.quickAmountButton}
                >
                  {quickAmount}
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
              <span className={styles.infoValue}>{amount} ETH</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                Platform Fee ({platformFeePercent}%)
              </span>
              <span className={styles.infoValue}>${platformFee}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Recipient Gets</span>
              <span className={styles.infoValue}>{recipientGets} ETH</span>
            </div>
          </div>

          {/* Send Button */}
          <TransactionWrapper
            calls={calls}
            onStatus={handleLifecycleStatus}
            disabled={!recipient || calls.length === 0}
          />
        </div>

        {/* Balance Card */}
        {/* <div className={styles.card}>
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
        </div> */}

        {/* Stats Card */}
        {/* <div className={styles.card}>
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
        </div> */}
      </div>
    </div>
  );
}

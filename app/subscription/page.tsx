"use client";

import { TransactionWrapper } from "@/components/TransactionWrapper";
import { Address, Avatar, Identity, Name } from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useState } from "react";
import { formatEther } from "viem";
import {
  Frequency,
  SubscriptionStatus,
  useRecurringTips,
} from "../hooks/useRecurringTips";
import styles from "./subscription.module.css";

type Currency = "ETH" | "USDC";

export default function Subscriptions() {
  const [view, setView] = useState<"create" | "manage">("create");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");
  const [amount, setAmount] = useState("10");
  const [recipient, setRecipient] = useState("");
  const [frequency, setFrequency] = useState<Frequency>(Frequency.Monthly);
  const [depositAmount, setDepositAmount] = useState("");

  const {
    isConnected,
    deposits,
    subscriptions,
    receivedSubscriptions,
    loading,
    isTransacting,
    buildDepositEthCall,
    // buildWithdrawEthCall,
    buildCreateSubscriptionEthCall,
    buildPauseSubscriptionCall,
    buildResumeSubscriptionCall,
    buildCancelSubscriptionCall,
    buildEmergencyWithdrawCall,
    handleLifecycleStatus,
  } = useRecurringTips();

  const quickAmounts = ["5", "10", "25", "50"];

  const getStatusBadge = (status: SubscriptionStatus) => {
    const styles = {
      [SubscriptionStatus.Active]: { bg: "#d4edda", color: "#155724" },
      [SubscriptionStatus.Paused]: { bg: "#fff3cd", color: "#856404" },
      [SubscriptionStatus.Cancelled]: { bg: "#f8d7da", color: "#721c24" },
      [SubscriptionStatus.Insufficient]: { bg: "#ffe5d0", color: "#8b4513" },
    };

    const labels = {
      [SubscriptionStatus.Active]: "Active",
      [SubscriptionStatus.Paused]: "Paused",
      [SubscriptionStatus.Cancelled]: "Cancelled",
      [SubscriptionStatus.Insufficient]: "Insufficient",
    };

    const style = styles[status];
    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 700,
          backgroundColor: style.bg,
          color: style.color,
        }}
      >
        {labels[status]}
      </span>
    );
  };

  const getFrequencyLabel = (freq: Frequency) => {
    return {
      [Frequency.Weekly]: "Weekly",
      [Frequency.BiWeekly]: "Bi-Weekly",
      [Frequency.Monthly]: "Monthly",
    }[freq];
  };

  if (!isConnected) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.connectCard}>
            <h1 className={styles.connectTitle}>Connect Wallet</h1>
            <p className={styles.connectSubtitle}>
              Connect your wallet to manage subscriptions
            </p>
            <Wallet>
              <ConnectWallet>
                <Avatar />
                <Name />
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <Wallet>
          <ConnectWallet>
            <Avatar />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Subscriptions</h1>
          <p className={styles.subtitle}>Recurring payments made easy</p>
        </header>

        {/* View Toggle */}
        <div className={styles.viewToggle}>
          <button
            onClick={() => setView("create")}
            className={`${styles.viewButton} ${
              view === "create" ? styles.active : ""
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setView("manage")}
            className={`${styles.viewButton} ${
              view === "manage" ? styles.active : ""
            }`}
          >
            Manage ({subscriptions.length})
          </button>
        </div>

        {view === "create" ? (
          <>
            {/* Deposit Card */}
            <div className={styles.card}>
              <label className={styles.label}>Your Deposit Balance</label>

              <div className={styles.balanceBox}>
                <div className={styles.balanceRow}>
                  <span className={styles.balanceLabel}>ETH Deposited</span>
                  <span className={styles.balanceValue}>
                    {formatEther(deposits.eth)} ETH
                  </span>
                </div>
                <div className={styles.balanceRow}>
                  <span className={styles.balanceLabel}>USDC Deposited</span>
                  <span className={styles.balanceValue}>
                    {formatEther(deposits.usdc)} USDC
                  </span>
                </div>
              </div>

              <div className={styles.depositSection}>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount to deposit"
                  className={styles.input}
                />
                <TransactionWrapper
                  calls={
                    depositAmount ? [buildDepositEthCall(depositAmount)] : []
                  }
                  onStatus={handleLifecycleStatus}
                >
                  Deposit ETH
                </TransactionWrapper>
              </div>

              <div className={styles.emergencySection}>
                <p className={styles.emergencyText}>
                  Need to withdraw everything?
                </p>
                <TransactionWrapper
                  calls={[buildEmergencyWithdrawCall()]}
                  onStatus={handleLifecycleStatus}
                >
                  Emergency Withdraw All
                </TransactionWrapper>
              </div>
            </div>

            {/* Create Subscription Card */}
            <div className={styles.card}>
              <label className={styles.label}>Create Subscription</label>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Recipient</label>
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
                        selectedCurrency === currency
                          ? styles.activeCurrency
                          : ""
                      }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className={styles.amountDisplay}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

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

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(Number(e.target.value) as Frequency)
                  }
                  className={styles.select}
                >
                  <option value={Frequency.Weekly}>
                    Weekly (every 7 days)
                  </option>
                  <option value={Frequency.BiWeekly}>
                    Bi-Weekly (every 14 days)
                  </option>
                  <option value={Frequency.Monthly}>
                    Monthly (every 30 days)
                  </option>
                </select>
              </div>

              <div className={styles.divider} />

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>First payment</span>
                <span className={styles.infoValue}>Immediate</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Next payment</span>
                <span className={styles.infoValue}>
                  {getFrequencyLabel(frequency)} from now
                </span>
              </div>

              <TransactionWrapper
                calls={
                  recipient && amount
                    ? [
                        buildCreateSubscriptionEthCall(
                          recipient as `0x${string}`,
                          amount,
                          frequency
                        ),
                      ]
                    : []
                }
                onStatus={handleLifecycleStatus}
              >
                {isTransacting ? "Creating..." : "Create Subscription"}
              </TransactionWrapper>
            </div>
          </>
        ) : (
          <>
            {/* Active Subscriptions */}
            <div className={styles.card}>
              <label className={styles.label}>Your Active Subscriptions</label>

              {loading ? (
                <p className={styles.emptyState}>Loading...</p>
              ) : subscriptions.length === 0 ? (
                <p className={styles.emptyState}>No subscriptions yet</p>
              ) : (
                <div className={styles.subscriptionsList}>
                  {subscriptions.map((sub, index) => (
                    <div key={index} className={styles.subscriptionCard}>
                      <div className={styles.subscriptionHeader}>
                        <div>
                          <div className={styles.subscriptionRecipient}>
                            To: {sub.recipient.slice(0, 6)}...
                            {sub.recipient.slice(-4)}
                          </div>
                          <div className={styles.subscriptionAmount}>
                            {formatEther(sub.amount)}{" "}
                            {sub.isEth ? "ETH" : "USDC"} •{" "}
                            {getFrequencyLabel(sub.frequency)}
                          </div>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className={styles.subscriptionStats}>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {formatEther(sub.totalPaid)}
                          </div>
                          <div className={styles.statLabel}>Total Paid</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {sub.paymentCount.toString()}
                          </div>
                          <div className={styles.statLabel}>Payments</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {new Date(
                              Number(sub.nextPayment) * 1000
                            ).toLocaleDateString()}
                          </div>
                          <div className={styles.statLabel}>Next Payment</div>
                        </div>
                      </div>

                      <div className={styles.subscriptionActions}>
                        {sub.status === SubscriptionStatus.Active && (
                          <TransactionWrapper
                            calls={[buildPauseSubscriptionCall(BigInt(index))]}
                            onStatus={handleLifecycleStatus}
                          >
                            Pause
                          </TransactionWrapper>
                        )}

                        {sub.status === SubscriptionStatus.Paused && (
                          <TransactionWrapper
                            calls={[buildResumeSubscriptionCall(BigInt(index))]}
                            onStatus={handleLifecycleStatus}
                          >
                            Resume
                          </TransactionWrapper>
                        )}

                        {(sub.status === SubscriptionStatus.Active ||
                          sub.status === SubscriptionStatus.Paused) && (
                          <TransactionWrapper
                            calls={[buildCancelSubscriptionCall(BigInt(index))]}
                            onStatus={handleLifecycleStatus}
                          >
                            Cancel
                          </TransactionWrapper>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Received Subscriptions */}
            {receivedSubscriptions.length > 0 && (
              <div className={styles.card}>
                <label className={styles.label}>
                  Subscriptions You Receive
                </label>

                <div className={styles.subscriptionsList}>
                  {receivedSubscriptions.map((sub, index) => (
                    <div
                      key={index}
                      className={styles.subscriptionCard}
                      style={{ backgroundColor: "#f0f9ff" }}
                    >
                      <div className={styles.subscriptionHeader}>
                        <div>
                          <div className={styles.subscriptionRecipient}>
                            From: {sub.subscriber.slice(0, 6)}...
                            {sub.subscriber.slice(-4)}
                          </div>
                          <div className={styles.subscriptionAmount}>
                            {formatEther(sub.amount)}{" "}
                            {sub.isEth ? "ETH" : "USDC"} •{" "}
                            {getFrequencyLabel(sub.frequency)}
                          </div>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className={styles.subscriptionStats}>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {formatEther(sub.totalPaid)}
                          </div>
                          <div className={styles.statLabel}>Total Received</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {sub.paymentCount.toString()}
                          </div>
                          <div className={styles.statLabel}>Payments</div>
                        </div>
                        <div className={styles.statBox}>
                          <div className={styles.statValue}>
                            {new Date(
                              Number(sub.nextPayment) * 1000
                            ).toLocaleDateString()}
                          </div>
                          <div className={styles.statLabel}>Next Payment</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

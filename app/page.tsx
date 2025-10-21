"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { useTipping } from "./hooks/useTipping";

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
    <div className="min-h-screen bg-[#FAFAFA] px-5 py-5">
      <div className="mx-auto max-w-[480px]">
        {/* Header */}
        <header className="mb-12 pt-[60px] text-center">
          <h1 className="mb-2 text-5xl font-black tracking-[-2px] text-secondary">
            TipBase
          </h1>
          <p className="text-base font-medium text-[#666]">
            Fast & Simple Tips on Base
          </p>
        </header>

        <div className="mb-4 rounded-2xl border border-[#E8E8E8] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-8">
            <label className="mb-2.5 block text-sm font-semibold uppercase tracking-[0.5px] text-black/80">
              Send To
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or ENS"
              className="w-full rounded-[10px] border-2 border-[#E8E8E8] bg-white px-4 py-3.5 text-[15px] font-medium text-black transition-all placeholder:text-[#AAA] focus:border-[#0052FF] focus:outline-none"
            />
          </div>

          <div className="my-8 text-center">
            <div className="mb-5 inline-flex gap-2 rounded-[10px] bg-[#F5F5F5] p-1">
              {(["ETH", "USDC"] as Currency[]).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`rounded-lg px-6 py-2 text-sm font-bold transition-all ${
                    selectedCurrency === currency
                      ? "bg-white text-secondary shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      : "bg-transparent text-[#666]"
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            <div className="mb-2 text-[56px] font-black tracking-[-2px] text-black">
              ${amount.toFixed(2)}
            </div>
            <div className="mb-5 text-base font-semibold text-[#888]">
              ≈ {ethAmount.toFixed(4)} ETH
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex justify-center gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className="rounded-lg border-2 border-[#E8E8E8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] transition-all hover:border-[#0052FF] hover:text-[#0052FF]"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px bg-[#E8E8E8]" />

          {/* Message Input */}
          <div className="mb-8">
            <label className="mb-2.5 block text-[13px] font-semibold uppercase tracking-[0.5px] text-[#333]">
              Message (Optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a nice message..."
              className="w-full rounded-[10px] border-2 border-[#E8E8E8] bg-white px-4 py-3.5 text-[15px] font-medium text-black transition-all placeholder:text-[#AAA] focus:border-[#0052FF] focus:outline-none"
            />
          </div>

          {/* Info Rows */}
          <div>
            <div className="flex items-center justify-between border-b border-[#F0F0F0] py-4">
              <span className="text-sm font-semibold text-[#666]">Amount</span>
              <span className="text-[15px] font-bold text-black">
                ${amount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#F0F0F0] py-4">
              <span className="text-sm font-semibold text-[#666]">
                Platform Fee ({platformFeePercent}%)
              </span>
              <span className="text-[15px] font-bold text-black">
                ${platformFee.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-semibold text-[#666]">
                Recipient Gets
              </span>
              <span className="text-[15px] font-bold text-black">
                ${recipientGets.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Send Button */}
          <button className="w-full rounded-xl bg-[#0052FF] px-4 py-[18px] text-base font-bold text-white transition-all hover:bg-[#0041CC] hover:-translate-y-px active:translate-y-0">
            Send Tip Now
          </button>
        </div>

        {/* Balance Card */}
        <div className="mb-4 rounded-2xl border border-[#E8E8E8] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <label className="mb-2.5 block text-[13px] font-semibold uppercase tracking-[0.5px] text-[#333]">
            Your Balance
          </label>

          <div className="mb-5 rounded-xl bg-[#F9FAFB] p-5">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold text-[#666]">ETH</span>
              <span className="text-lg font-extrabold text-black">
                0.124 ETH
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-semibold text-[#666]">USDC</span>
              <span className="text-lg font-extrabold text-black">
                45.00 USDC
              </span>
            </div>
          </div>

          <button className="w-full rounded-xl bg-[#0052FF] px-4 py-[18px] text-base font-bold text-white transition-all hover:bg-[#0041CC] hover:-translate-y-px active:translate-y-0">
            Withdraw
          </button>
        </div>

        {/* Stats Card */}
        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex justify-around py-6">
            <div className="text-center">
              <div className="mb-1 text-[28px] font-black text-[#0052FF]">
                1,234
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.5px] text-[#888]">
                Total Tips
              </div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-[28px] font-black text-[#0052FF]">
                $42K
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.5px] text-[#888]">
                Volume
              </div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-[28px] font-black text-[#0052FF]">
                $840
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.5px] text-[#888]">
                Earned
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

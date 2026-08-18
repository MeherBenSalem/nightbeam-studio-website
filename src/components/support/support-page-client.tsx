"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

interface RecurringTier {
  priceId: string;
  amount: number;
  label: string;
}

interface Props {
  recurringTiers: RecurringTier[];
}

const PRESET_AMOUNTS = [5, 10, 25, 50];

export function SupportPageClient({ recurringTiers }: Props) {
  const [tab, setTab] = useState<"onetime" | "monthly">("onetime");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;

  async function handleDonate() {
    setError(null);
    setLoading(true);

    try {
      const body =
        tab === "onetime"
          ? { mode: "payment" as const, amount: effectiveAmount }
          : { mode: "subscription" as const, priceId: selectedAmount?.toString() };

      const res = await fetch("/api/stripe/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecurring(priceId: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "subscription", priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Tab toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setTab("onetime")}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
            tab === "onetime"
              ? "bg-purple-600 text-white"
              : "bg-night-800 text-slate-400 hover:text-white"
          }`}
        >
          One-time
        </button>
        {recurringTiers.length > 0 && (
          <button
            onClick={() => setTab("monthly")}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
              tab === "monthly"
                ? "bg-purple-600 text-white"
                : "bg-night-800 text-slate-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
        )}
      </div>

      {tab === "onetime" && (
        <Card>
          <CardBody className="space-y-6">
            <p className="text-center text-slate-300">Choose an amount or enter your own</p>

            {/* Preset amounts */}
            <div className="flex flex-wrap justify-center gap-3">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`rounded-lg border px-5 py-3 text-lg font-semibold transition ${
                    selectedAmount === amt && !customAmount
                      ? "border-purple-500 bg-purple-600/20 text-white"
                      : "border-night-500/60 bg-night-800 text-slate-300 hover:border-purple-500/60"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mx-auto flex max-w-xs items-center gap-2">
              <span className="text-lg text-slate-400">$</span>
              <input
                type="number"
                min={1}
                max={10000}
                placeholder="Custom"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full rounded-lg border border-night-500/60 bg-night-900 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                disabled={!effectiveAmount || effectiveAmount < 1 || loading}
                onClick={handleDonate}
              >
                {loading ? "Redirecting..." : `Donate $${effectiveAmount || 0}`}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "monthly" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {recurringTiers.map((tier) => (
            <Card key={tier.priceId}>
              <CardBody className="flex flex-col items-center gap-4 text-center">
                <span className="text-sm font-medium text-purple-400">{tier.label}</span>
                <span className="text-3xl font-bold text-white">${tier.amount}</span>
                <span className="text-sm text-slate-400">per month</span>
                <Button
                  variant="primary"
                  disabled={loading}
                  onClick={() => handleRecurring(tier.priceId)}
                >
                  {loading ? "..." : "Subscribe"}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

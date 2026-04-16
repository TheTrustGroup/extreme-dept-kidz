"use client";

import * as React from "react";
import { apiUrl } from "@/lib/config/api-base";

interface RetryMetrics {
  pending: number;
  failed: number;
  dead: number;
}

interface RetryResult {
  scanned: number;
  sent: number;
  failed: number;
  dead: number;
}

export default function NotificationRetryPage(): JSX.Element {
  const [metrics, setMetrics] = React.useState<RetryMetrics>({
    pending: 0,
    failed: 0,
    dead: 0,
  });
  const [lastRun, setLastRun] = React.useState<RetryResult | null>(null);
  const [running, setRunning] = React.useState(false);

  const loadMetrics = React.useCallback(async () => {
    const response = await fetch(apiUrl("/api/admin/notifications/retry"), {
      credentials: "include",
    });
    if (!response.ok) return;
    const payload = (await response.json()) as {
      data?: { queue?: RetryMetrics };
    };
    if (payload.data?.queue) {
      setMetrics(payload.data.queue);
    }
  }, []);

  React.useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const runRetry = async (): Promise<void> => {
    setRunning(true);
    try {
      const response = await fetch(apiUrl("/api/admin/notifications/retry"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 50 }),
      });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        data?: { result?: RetryResult; queue?: RetryMetrics };
      };
      if (payload.data?.result) {
        setLastRun(payload.data.result);
      }
      if (payload.data?.queue) {
        setMetrics(payload.data.queue);
      } else {
        await loadMetrics();
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          background: "var(--adm-s1)",
          border: "1px solid var(--adm-b1)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, color: "var(--adm-t1)" }}>Notification retries</h1>
        <p style={{ marginTop: 6, marginBottom: 0, fontSize: 12, color: "var(--adm-t3)" }}>
          Monitor failed business/customer email deliveries and manually trigger a retry pass.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {[
          { label: "Pending", value: metrics.pending, color: "var(--adm-sky)" },
          { label: "Failed", value: metrics.failed, color: "var(--adm-gold)" },
          { label: "Dead", value: metrics.dead, color: "var(--adm-rose)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "var(--adm-s1)",
              border: "1px solid var(--adm-b1)",
              borderRadius: 8,
              padding: 14,
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: "var(--adm-t3)" }}>{item.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: 24, color: item.color, fontWeight: 600 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--adm-s1)",
          border: "1px solid var(--adm-b1)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <button
          onClick={runRetry}
          disabled={running}
          style={{
            height: 34,
            padding: "0 12px",
            borderRadius: 6,
            border: "1px solid var(--adm-b2)",
            background: running ? "var(--adm-s2)" : "var(--adm-gold)",
            color: running ? "var(--adm-t3)" : "#0a0a0f",
            fontSize: 12,
            fontWeight: 600,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "Retrying..." : "Run retry now"}
        </button>

        {lastRun && (
          <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "var(--adm-t2)" }}>
            Last run - scanned: {lastRun.scanned}, sent: {lastRun.sent}, failed: {lastRun.failed}, dead: {lastRun.dead}
          </p>
        )}
      </div>
    </div>
  );
}

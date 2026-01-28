"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Eye, Loader2, RefreshCw } from "lucide-react";

/**
 * Settings Page
 *
 * Store configuration and settings.
 */
export default function SettingsPage(): JSX.Element {
  const [fixing, setFixing] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [fixResult, setFixResult] = React.useState<{ ok: boolean; message: string; visibleInBoys?: number; visibleInGirls?: number } | null>(null);

  const handleFixVisibility = async () => {
    setFixing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/admin/fix-product-visibility", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setFixResult({
          ok: true,
          message: data.message ?? "Done.",
          visibleInBoys: data.data?.visibleInBoys,
          visibleInGirls: data.data?.visibleInGirls,
        });
      } else {
        setFixResult({ ok: false, message: data.error ?? data.message ?? "Request failed." });
      }
    } catch (e) {
      setFixResult({ ok: false, message: e instanceof Error ? e.message : "Network error." });
    } finally {
      setFixing(false);
    }
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/admin/revalidate-collections", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setFixResult({ ok: true, message: data.message ?? "Cache refreshed." });
      } else {
        setFixResult({ ok: false, message: data.error ?? data.message ?? "Request failed." });
      }
    } catch (e) {
      setFixResult({ ok: false, message: e instanceof Error ? e.message : "Network error." });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Settings</H1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-cream-50 rounded-xl border border-cream-200 p-4 space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg bg-navy-900 text-cream-50 font-semibold">
              General
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-charcoal-700 hover:bg-cream-100">
              Shipping
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-charcoal-700 hover:bg-cream-100">
              Payments
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-charcoal-700 hover:bg-cream-100">
              Notifications
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <div className="bg-cream-50 rounded-xl border border-cream-200 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 mb-4">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Extreme Dept Kidz"
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                    Store Email
                  </label>
                  <input
                    type="email"
                    defaultValue="info@extremedeptkidz.com"
                    className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                    Currency
                  </label>
                  <select className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                    <option>GHS - Ghana Cedis</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal-900 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
                    <option>(GMT+0) Greenwich Mean Time</option>
                    <option>(GMT-5) Eastern Time</option>
                    <option>(GMT+1) Central European Time</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary">Save Changes</Button>
            </div>

            <div className="border-t border-cream-200 pt-6 mt-6">
              <h2 className="text-xl font-bold text-charcoal-900 mb-2">Product visibility</h2>
              <p className="text-sm text-charcoal-600 mb-4">
                If products created in admin don’t show on /collections/boys or /collections/girls, first run Fix product visibility to ensure Boys/Girls exist and products are assigned; then run Refresh site cache so collection pages show fresh data.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleFixVisibility}
                  disabled={fixing || refreshing}
                  className="inline-flex items-center gap-2"
                >
                  {fixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  {fixing ? "Running…" : "Fix product visibility"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRefreshCache}
                  disabled={fixing || refreshing}
                  className="inline-flex items-center gap-2"
                >
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {refreshing ? "Refreshing…" : "Refresh site cache"}
                </Button>
                {fixResult && (
                  <span
                    className={
                      fixResult.ok
                        ? "text-green-700 text-sm"
                        : "text-red-700 text-sm"
                    }
                  >
                    {fixResult.ok && fixResult.visibleInBoys != null
                      ? `${fixResult.message} Boys: ${fixResult.visibleInBoys}, Girls: ${fixResult.visibleInGirls ?? 0}`
                      : fixResult.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

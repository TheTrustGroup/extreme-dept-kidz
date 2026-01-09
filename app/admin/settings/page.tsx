"use client";

import * as React from "react";
import { Settings, Store, Mail, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";

/**
 * Settings Page
 * 
 * Store configuration and settings.
 */
export default function SettingsPage(): JSX.Element {
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
                    defaultValue="admin@extremedeptkidz.com"
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
          </div>
        </div>
      </div>
    </div>
  );
}

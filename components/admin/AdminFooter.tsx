"use client";

import Link from "next/link";
import { ShoppingBag, ExternalLink, Mail, BarChart3, Shield, Zap } from "lucide-react";

export function AdminFooter(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900/95 backdrop-blur-md border-t border-navy-800/50 text-cream-50 mt-8 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-cream-50/10 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-cream-50" />
              </div>
              <span className="text-lg font-bold">Extreme Dept Kidz</span>
            </div>
            <p className="text-sm text-cream-200/80 leading-relaxed max-w-md">
              Premium fashion for the modern family. Manage your e-commerce operations with precision and style.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-1 text-xs text-cream-200/70 bg-navy-800/50 px-2 py-1 rounded">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-cream-200/70 bg-navy-800/50 px-2 py-1 rounded">
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-cream-200/70 bg-navy-800/50 px-2 py-1 rounded">
                <BarChart3 className="w-3 h-3" />
                <span>Analytics</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-cream-50">
              Quick Actions
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  target="_blank"
                  className="text-sm text-cream-200/80 hover:text-cream-50 transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Store</span>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@extremedeptkidz.com"
                  className="text-sm text-cream-200/80 hover:text-cream-50 transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <Mail className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800/50 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-cream-200/60">
              © {currentYear} <span className="font-semibold text-cream-50">Extreme Dept Kidz</span>. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-cream-200/60">
              <span className="px-2 py-1 bg-navy-800/50 rounded text-xs font-medium">Admin Panel v1.0</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Powered by Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

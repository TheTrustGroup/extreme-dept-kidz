"use client";

import Link from "next/link";
import { ShoppingBag, ExternalLink, Mail, BarChart3, Shield, Zap, Lock } from "lucide-react";
import { AdminBody, AdminBodySmall, AdminCaption } from "@/components/admin/AdminTypography";

export function AdminFooter(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900/95 backdrop-blur-xl border-t border-navy-800/30 text-cream-50 mt-[var(--admin-space-7)] shadow-xl" style={{ boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08)" }}>
      <div className="max-w-7xl mx-auto px-[var(--admin-space-4)] sm:px-[var(--admin-space-5)] lg:px-[var(--admin-space-7)] py-[var(--admin-space-7)]">
        {/* Main Footer Content */}
        <div className="admin-grid-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-[var(--admin-space-7)]">
          {/* Brand Section */}
          <div className="admin-rhythm-md lg:col-span-2">
            <div className="admin-flex-sm items-center mb-[var(--admin-space-3)]">
              <div className="bg-cream-50/10 backdrop-blur-sm p-[var(--admin-space-2)] rounded-lg border border-cream-50/10">
                <ShoppingBag className="w-5 h-5 text-cream-50" />
              </div>
              <AdminBody className="text-lg font-bold text-cream-50">Extreme Dept Kidz</AdminBody>
            </div>
            <AdminBodySmall className="text-cream-200/80 leading-relaxed max-w-md">
              Premium fashion for the modern family. Manage your e-commerce operations with precision and style.
            </AdminBodySmall>
            <div className="admin-flex-md flex-wrap items-center pt-[var(--admin-space-2)]">
              <div className="admin-flex-sm items-center text-xs text-cream-200/70 bg-navy-800/60 backdrop-blur-sm px-[var(--admin-space-2)] py-1 rounded border border-navy-700/30" style={{ overflow: 'visible' }}>
                <div 
                  className="flex-shrink-0 flex items-center justify-center" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    minWidth: '12px', 
                    minHeight: '12px',
                    aspectRatio: '1 / 1',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Shield 
                    className="w-full h-full" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      display: 'block', 
                      flexShrink: 0,
                      overflow: 'visible',
                      position: 'relative'
                    }} 
                  />
                </div>
                <span>Secure</span>
              </div>
              <div className="admin-flex-sm items-center text-xs text-cream-200/70 bg-navy-800/60 backdrop-blur-sm px-[var(--admin-space-2)] py-1 rounded border border-navy-700/30" style={{ overflow: 'visible' }}>
                <div 
                  className="flex-shrink-0 flex items-center justify-center" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    minWidth: '12px', 
                    minHeight: '12px',
                    aspectRatio: '1 / 1',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Lock 
                    className="w-full h-full" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      display: 'block', 
                      flexShrink: 0,
                      overflow: 'visible',
                      position: 'relative'
                    }} 
                  />
                </div>
                <span>SSL Encrypted</span>
              </div>
              <div className="admin-flex-sm items-center text-xs text-cream-200/70 bg-navy-800/60 backdrop-blur-sm px-[var(--admin-space-2)] py-1 rounded border border-navy-700/30" style={{ overflow: 'visible' }}>
                <div 
                  className="flex-shrink-0 flex items-center justify-center" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    minWidth: '12px', 
                    minHeight: '12px',
                    aspectRatio: '1 / 1',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Zap 
                    className="w-full h-full" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      display: 'block', 
                      flexShrink: 0,
                      overflow: 'visible',
                      position: 'relative'
                    }} 
                  />
                </div>
                <span>Fast</span>
              </div>
              <div className="admin-flex-sm items-center text-xs text-cream-200/70 bg-navy-800/60 backdrop-blur-sm px-[var(--admin-space-2)] py-1 rounded border border-navy-700/30" style={{ overflow: 'visible' }}>
                <div 
                  className="flex-shrink-0 flex items-center justify-center" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    minWidth: '12px', 
                    minHeight: '12px',
                    aspectRatio: '1 / 1',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <BarChart3 
                    className="w-full h-full" 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      display: 'block', 
                      flexShrink: 0,
                      overflow: 'visible',
                      position: 'relative'
                    }} 
                  />
                </div>
                <span>Analytics</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div>
            <AdminCaption className="text-sm font-semibold mb-[var(--admin-space-4)] text-cream-50 normal-case">
              Quick Actions
            </AdminCaption>
            <ul className="admin-rhythm-md">
              <li>
                <Link
                  href="/"
                  target="_blank"
                  className="text-sm text-cream-200/80 hover:text-cream-50 transition-all duration-200 admin-flex-sm items-center group hover:translate-x-1"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <AdminBodySmall>View Store</AdminBodySmall>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@extremedeptkidz.com"
                  className="text-sm text-cream-200/80 hover:text-cream-50 transition-all duration-200 admin-flex-sm items-center group hover:translate-x-1"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <AdminBodySmall>Support</AdminBodySmall>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800/30 pt-[var(--admin-space-5)]">
          <div className="admin-flex-md flex-col md:flex-row items-center justify-between md:gap-0">
            <AdminBodySmall className="text-cream-200/60">
              © {currentYear} <span className="font-semibold text-cream-50">Extreme Dept Kidz</span>. All rights reserved.
            </AdminBodySmall>
            <div className="admin-flex-md items-center text-sm text-cream-200/60">
              <AdminCaption className="px-[var(--admin-space-2)] py-1 bg-navy-800/60 backdrop-blur-sm rounded text-xs font-medium normal-case border border-navy-700/30">Admin Panel v1.0</AdminCaption>
              <span className="hidden sm:inline">•</span>
              <AdminBodySmall className="hidden sm:inline">Powered by Next.js</AdminBodySmall>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

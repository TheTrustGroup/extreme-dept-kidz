"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { User, LogOut, Package, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUserAuth } from "@/lib/stores/user-auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/lib/hooks/use-keyboard-navigation";
import { SignInModal } from "./SignInModal";
import { CreateAccountModal } from "./CreateAccountModal";

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function AccountDropdown({ isOpen, onClose, triggerRef }: AccountDropdownProps): JSX.Element {
  const { user, isAuthenticated, logout } = useUserAuth();
  const { theme } = useTheme();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isSignInOpen, setIsSignInOpen] = React.useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = React.useState(false);

  // Focus trap for accessibility
  useFocusTrap(dropdownRef, isOpen);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleSignOut = (): void => {
    logout();
    onClose();
  };

  const handleSignInClick = (): void => {
    onClose();
    setIsSignInOpen(true);
  };

  const handleSignUpClick = (): void => {
    onClose();
    setIsSignUpOpen(true);
  };

  if (!isOpen) return <></>;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              className="fixed inset-0 z-[9997]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <m.div
              ref={dropdownRef}
              className={cn(
                "absolute right-0 top-full mt-2 z-[9998]",
                "w-64 rounded-lg shadow-xl border",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-cream-50 border-cream-200",
                "overflow-hidden"
              )}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="menu"
              aria-label="Account menu"
            >
              {isAuthenticated && user ? (
                <>
                  {/* User Info */}
                  <div className={cn(
                    "px-4 py-3 border-b",
                    theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
                  )}>
                    <p className={cn(
                      "font-semibold text-sm",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      {user.name}
                    </p>
                    <p className={cn(
                      "text-xs mt-0.5",
                      theme === "dark" ? "text-dark-text-muted" : "text-charcoal-600"
                    )}>
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/account"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        "hover:bg-cream-100",
                        theme === "dark" && "hover:bg-dark-bg-secondary",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900",
                        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
                      )}
                      role="menuitem"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        "hover:bg-cream-100",
                        theme === "dark" && "hover:bg-dark-bg-secondary",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900",
                        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
                      )}
                      role="menuitem"
                    >
                      <Package className="w-4 h-4" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        "hover:bg-cream-100",
                        theme === "dark" && "hover:bg-dark-bg-secondary",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900",
                        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-navy-500"
                      )}
                      role="menuitem"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Wishlist</span>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className={cn(
                    "px-4 py-2 border-t",
                    theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
                  )}>
                    <button
                      onClick={handleSignOut}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors rounded-lg",
                        "hover:bg-cream-100",
                        theme === "dark" && "hover:bg-dark-bg-secondary",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900",
                        "focus:outline-none focus:ring-2 focus:ring-navy-500"
                      )}
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 space-y-3">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleSignInClick}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleSignUpClick}
                  >
                    Create Account
                  </Button>
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInOpen(false);
          setIsSignUpOpen(true);
        }}
      />

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpOpen(false);
          setIsSignInOpen(true);
        }}
      />
    </>
  );
}

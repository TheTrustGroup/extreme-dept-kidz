# Phase 5 — Accessibility & Inclusivity Audit

**Extreme Dept Kidz — Production E-commerce Audit**  
**Deliverables:** Accessibility issues, compliance fixes, UX improvements for inclusivity.

---

## 1. Executive Summary

The codebase has **substantial accessibility work** already: skip links, focus traps in major modals (QuickView, CartDrawer, SearchOverlay, SignIn, CreateAccount, AccountDropdown), ARIA labels and roles on dialogs and sections, form error association (aria-invalid, aria-describedby) in Contact, Auth, Newsletter, OrderSummary, and screen reader announcements (aria-live / status) in cart and search. **Gaps** include: (1) **live regions** hidden with `left: -10000px`, which can prevent some screen readers from announcing content; (2) **ConfirmDialog** missing role="dialog", aria-labelledby, and focus trap; (3) **CheckoutFormV2 FormField** not associating labels with inputs (optional id) and not exposing aria-invalid/aria-describedby on inputs; (4) **focus-visible** used only on Button—many interactive elements use `focus:` so mouse users get a ring on click (acceptable but focus-visible is preferable for keyboard-only); (5) **admin layout** main has no id="main-content" for skip link target. This document audits WCAG-related areas, lists issues and compliance fixes, and recommends inclusivity improvements.

---

## 2. Audit Findings

### 2.1 WCAG Compliance (High-Level)

| Criterion | Status | Notes |
|-----------|--------|-------|
| **1.1.1 Non-text Content** | ✅ | Images use descriptive alt; decorative icons use aria-hidden="true". OptimizedImage requires alt. |
| **1.3.1 Info and Relationships** | ⚠️ | Labels and structure mostly good. FormField in CheckoutFormV2 does not consistently associate label with input (id optional); error not linked via aria-describedby on input. |
| **1.4.3 Contrast (Minimum) AA** | ✅ | Design system (DESIGN_SYSTEM_PALETTE_TYPOGRAPHY.md) states charcoal-900 on cream-50 and navy-900 on cream-50 meet WCAG AA. |
| **2.1.1 Keyboard** | ✅ | Interactive elements are focusable; modals trap focus (QuickView, CartDrawer, SearchOverlay, SignIn, CreateAccount, AccountDropdown, MobileNav). ConfirmDialog has Escape but no focus trap. |
| **2.1.2 No Keyboard Trap** | ✅ | Focus traps allow Tab cycle within modal; Escape closes where implemented. |
| **2.4.1 Bypass Blocks** | ✅ | SkipLinks to #main-content, #main-navigation, #footer; main has id="main-content" and role="main"; Header has id="main-navigation"; Footer has id="footer". |
| **2.4.3 Focus Order** | ✅ | Logical DOM order; no positive tabindex. |
| **2.4.7 Focus Visible** | ✅ | globals.css :focus-visible outline; Button uses focus-visible:ring. Many components use focus:ring (visible on both keyboard and mouse). |
| **3.2.1 On Focus** | ✅ | No unexpected context change on focus. |
| **4.1.2 Name, Role, Value** | ⚠️ | Dialogs have role and often aria-labelledby; ConfirmDialog lacks role/dialog and aria-labelledby. Form inputs need programmatic association and error linkage. |
| **4.1.3 Status Messages** | ❌ | [role="status"] and [aria-live] are styled with position: absolute; left: -10000px. Moving content off-screen can prevent some assistive technologies from announcing live regions; prefer visually-hidden (clip) pattern. |

---

### 2.2 Contrast Ratios

| Pair | Use | Expected |
|------|-----|----------|
| charcoal-900 (#1c1c1c) on cream-50 (#faf9f7) | Body text | ≥4.5:1 (AA) |
| navy-900 (#0b1f36) on cream-50 | Buttons, links | ≥4.5:1 (AA) |
| charcoal-600/700 on cream-50 | Secondary text | ≥4.5:1 (AA) |

Design tokens are chosen for WCAG AA. **Recommendation:** Periodically verify with a contrast checker (e.g. WebAIM) when changing tokens; document contrast expectations in design system.

---

### 2.3 Screen Reader Compatibility

| Area | Status | Notes |
|------|--------|-------|
| **Skip links** | ✅ | SkipLinks visible on first Tab; links to main, nav, footer. |
| **Landmarks** | ✅ | main (role="main"), nav (aria-label), footer (id="footer"). |
| **Headings** | ✅ | One H1 per page; sections use H2/H3. |
| **Live regions** | ❌ | globals.css hides [role="status"] and [aria-live] with left: -10000px. Use .sr-only (clip) pattern so content remains in DOM and is announced. |
| **Dynamic announcements** | ✅ | CartDrawer, QuickViewModal, SearchOverlay create sr-only divs with role="status", aria-live="polite" for cart/search updates. |
| **Form labels** | ⚠️ | Contact, Auth, Newsletter, OrderSummary use htmlFor + id and aria-invalid/aria-describedby. CheckoutFormV2 FormField does not pass id to input or set aria-invalid/aria-describedby. |
| **Error messages** | ✅ | Error divs use role="alert" where present. FormField in CheckoutFormV2 has role="alert" on error text but input not linked via aria-describedby. |
| **Required fields** | ⚠️ | Required indicator is visual (*). FormField should set aria-required on the input and use aria-hidden on the asterisk. |

---

### 2.4 Focus Management

| Component | Focus trap | Escape | Notes |
|-----------|------------|--------|-------|
| QuickViewModal | ✅ useFocusTrap | ✅ | role="dialog", aria-modal, aria-labelledby |
| CartDrawer | ✅ useFocusTrap | ✅ | role="dialog", aria-modal; no aria-labelledby (acceptable with aria-label on drawer) |
| SearchOverlay | ✅ useFocusTrap | ✅ | role="dialog", aria-modal |
| SignInModal | ✅ useFocusTrap | ✅ | role="dialog", aria-modal, aria-labelledby |
| CreateAccountModal | ✅ useFocusTrap | ✅ | role="dialog", aria-modal, aria-labelledby |
| AccountDropdown | ✅ useFocusTrap | — | Dropdown, not modal |
| MobileNav | ✅ Custom trap | ✅ | role="dialog", aria-modal, aria-label="Navigation menu" |
| ConfirmDialog | ❌ | ✅ Escape | No focus trap; no role="dialog", aria-modal, or aria-labelledby |
| CartPreviewDropdown | role="dialog" | — | No useFocusTrap in grep; verify if focus trapped |
| CategoryFormModal | — | — | Has role="dialog", aria-labelledby; verify focus trap |
| CompleteTheLookSizeModal | — | — | Has role="dialog", aria-labelledby |
| CustomizeLookModal | — | — | Has role="dialog", aria-labelledby |

**Fixes:** Add useFocusTrap + role="dialog", aria-modal="true", and aria-labelledby to ConfirmDialog. Verify CartPreviewDropdown and other admin/customer modals for focus trap.

---

### 2.5 Keyboard Navigation

| Area | Status | Notes |
|------|--------|-------|
| Tab order | ✅ | No tabindex > 0; order follows DOM. |
| Enter/Space on buttons | ✅ | Native button/link behavior. |
| Escape to close | ✅ | Modals/drawers that use useFocusTrap or custom logic close on Escape. ConfirmDialog closes on Escape. |
| Arrow keys | ✅ | SearchOverlay and other components use arrow-key navigation where documented. |
| Skip links | ✅ | Appear on first Tab; focus-within reveals. |

No critical gaps. Ensure any new modal or drawer includes Escape to close and focus trap.

---

### 2.6 ARIA Labeling

| Area | Status | Notes |
|------|--------|-------|
| Dialogs | ✅ | Most have role="dialog", aria-modal="true"; many have aria-labelledby. ConfirmDialog and CartDrawer/SearchOverlay lack aria-labelledby (CartDrawer could use aria-label). |
| Sections | ✅ | Sections use aria-labelledby pointing to heading ids (e.g. shop-by-style-heading, new-arrivals-heading). |
| Buttons (icon-only) | ✅ | Close buttons use aria-label="Close"; cart button uses dynamic aria-label with count. |
| Form controls | ⚠️ | CheckoutFormV2 inputs not linked to labels/errors via id, aria-describedby, aria-invalid. |
| Radiogroups | ✅ | QuickViewModal size selection uses role="radiogroup" and role="radio" with aria-checked. |
| Decorative icons | ✅ | Lucide icons use aria-hidden="true" where decorative. |

**Fixes:** ConfirmDialog: add aria-labelledby to title. FormField (CheckoutFormV2): associate label and error with input via id and aria-describedby/aria-invalid.

---

### 2.7 Semantic Structure

| Element | Status | Notes |
|---------|--------|-------|
| main | ✅ | id="main-content", role="main" in app/layout.tsx. |
| nav | ✅ | Header nav has id="main-navigation", aria-label="Main navigation". |
| footer | ✅ | id="footer" on Footer component. |
| headings | ✅ | Single H1 per page; hierarchy H1 → H2 → H3. |
| lists | ✅ | SkipLinks uses <ul>/<li>; nav and lists use list markup where appropriate. |
| Admin main | ⚠️ | app/admin/layout.tsx main has no id="main-content". Skip link from admin would target customer main (different tree). Consider adding id="main-content" to admin main for consistency or document that skip is for storefront. |

---

## 3. Accessibility Issues (Summary)

1. **Critical – Live regions:** `[role="status"], [aria-live]` in globals.css use `left: -10000px`, which can prevent screen readers from announcing dynamic content. Replace with visually-hidden pattern (e.g. clip) consistent with .sr-only.
2. **Critical – ConfirmDialog:** Missing role="dialog", aria-modal="true", aria-labelledby, and focus trap. Add useFocusTrap and ARIA so assistive tech and keyboard users get correct behavior.
3. **High – CheckoutFormV2 FormField:** Label not associated with input (id optional); input missing aria-invalid and aria-describedby. Use useId(), pass id to label and input, add error id and aria-describedby/aria-invalid on input; add aria-required when required.
4. **Medium – Focus visibility:** Prefer focus-visible over focus for keyboard-only indication where possible (Button already uses focus-visible). Optional: gradually migrate high-traffic controls to focus-visible.
5. **Low – Admin main:** Admin layout main has no id="main-content". Add id for skip-link consistency or document behavior.
6. **Low – Required indicator:** FormField required asterisk should have aria-hidden="true"; input should have aria-required="true".

---

## 4. Compliance Fixes

### 4.1 Live Regions (globals.css)

**Current (problematic):**
```css
[role="status"],
[aria-live] {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

**Fix:** Use the same visually-hidden pattern as .sr-only so content is not moved off-screen (clip instead of left: -10000px). This keeps live region content in the layout flow for assistive tech while remaining visually hidden.

```css
[role="status"],
[aria-live] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 4.2 ConfirmDialog

- Add a wrapper ref and useFocusTrap(ref, isOpen).
- Add role="dialog", aria-modal="true", and aria-labelledby to the dialog container.
- Add id to the title element (e.g. id="confirm-dialog-title") and set aria-labelledby="confirm-dialog-title".
- Ensure first focusable element receives focus when opened (useFocusTrap already moves focus to first element).

### 4.3 CheckoutFormV2 FormField

- Use useId() to generate fieldId and errorId.
- Label: htmlFor={fieldId}.
- Error message container: id={errorId} when error is present.
- Clone the single child (input) with: id={fieldId}, aria-invalid={error ? "true" : "false"}, aria-describedby={error ? errorId : undefined}, aria-required={required ? "true" : undefined}.
- Wrap required asterisk in <span aria-hidden="true"> so screen readers get "required" from the control only.

### 4.4 Admin Main (Optional)

- In app/admin/layout.tsx, add id="main-content" to the main element so skip link "Skip to main content" targets admin main when on admin routes. (If skip links are only rendered in customer layout, no change needed; document which layout renders SkipLinks.)

---

## 5. UX Improvements for Inclusivity

### 5.1 Reduced Motion

- globals.css already has @media (prefers-reduced-motion: reduce) for scroll-behavior.
- **Recommendation:** For any new motion (e.g. modal enter/exit, carousels), respect prefers-reduced-motion: reduce (shorter duration or no animation) and document in MICRO_INTERACTIONS_SPEC or design system.

### 5.2 Error Messaging

- Checkout and auth already use role="alert" for errors and aria-describedby where implemented.
- **Recommendation:** Ensure all form flows (including checkout) expose validation errors to screen readers (aria-describedby + id on error element) and use clear, concise error text.

### 5.3 Language and Page Title

- layout.tsx sets lang (ensure html has lang="en" or appropriate value).
- **Recommendation:** Verify <html lang="..."> is set; document title and H1 alignment per page for orientation.

### 5.4 Touch Targets

- Button has min-h-[44px]; Phase 1 audit addressed StickyAddToCart and ProductCard.
- **Recommendation:** Keep minimum 44×44px for primary interactive elements; document in design system.

### 5.5 Inclusivity Checklist (Ongoing)

- [ ] Run automated a11y tests (e.g. axe-core, Lighthouse) in CI or pre-release.
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver) on key flows: browse, cart, checkout, account.
- [ ] Test keyboard-only: skip links, modals, form submission, cart.
- [ ] Verify contrast after any color token change.
- [ ] Document accessibility responsibilities in CONTRIBUTING or design system.

---

## 6. Files to Touch

| Priority | File | Change |
|----------|------|--------|
| Critical | app/globals.css | Replace [role="status"], [aria-live] with clip-based visually-hidden. |
| Critical | components/ui/ConfirmDialog.tsx | Add role="dialog", aria-modal="true", aria-labelledby, useFocusTrap. |
| High | components/checkout/CheckoutFormV2.tsx | FormField: useId(), label/input/error association, aria-invalid, aria-describedby, aria-required; aria-hidden on required *. |
| Low | app/admin/layout.tsx | Optional: add id="main-content" to main. |

---

## 7. Summary

| Area | Verdict | Main action |
|------|--------|-------------|
| WCAG (overall) | Good; a few gaps | Live regions, ConfirmDialog, FormField |
| Contrast | Good | Document and re-check on token changes |
| Screen reader | Good; one bug | Fix live region CSS |
| Focus management | Good; one gap | ConfirmDialog focus trap + ARIA |
| Keyboard | Good | — |
| ARIA | Good; two gaps | ConfirmDialog, FormField |
| Semantic structure | Good | Optional admin main id |

Implementing the **critical and high** fixes (live regions, ConfirmDialog, FormField) will address the main WCAG and inclusivity gaps identified in this audit.

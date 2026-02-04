# Currency Conversion Module

Multi-currency display for Extreme Dept Kidz. Store base currency is **GHS (Ghana Cedi)**; prices in the database are stored in **pesewas** (1 GHS = 100 pesewas).

## Features

- **Manual currency selection** via header dropdown (GHS, USD, EUR, GBP, CAD, NGN, XOF, ZAR, AUD, CHF).
- **Live exchange rates** from ExchangeRate-API (optional key) or open endpoint; **fallback rates** if the API fails.
- **Dynamic display** on product cards, product page, cart drawer, cart preview, checkout summary, and checkout form.
- **Locale-aware formatting** (symbol, thousand separators, decimal places) per currency.
- **Lightweight & SEO-friendly**: rates cached (1h), no blocking render; structured data can keep GHS for crawlers.

## Architecture

| Piece | Location | Role |
|-------|----------|------|
| Types & constants | `lib/currency/` | Supported currencies, fallback rates, base GHS |
| Format helpers | `lib/currency/format.ts` | Convert pesewas → amount, format with `Intl` |
| Rate fetch | `lib/currency/fetch-rates.ts` | Server-side fetch with fallback |
| API route | `app/api/currency/rates/route.ts` | GET rates, cache headers |
| Store | `lib/stores/currency-store.ts` | Selected currency (persisted to localStorage) |
| Provider | `components/providers/CurrencyProvider.tsx` | Fetches rates, exposes `formatPrice` |
| UI | `components/ui/FormattedPrice.tsx`, `CurrencySelector.tsx` | Display price, dropdown |

## Setup

1. **Optional API key** (recommended for production):  
   Add to `.env.local`:
   ```bash
   EXCHANGE_RATE_API_KEY=your-key
   ```
   Get a free key at [exchangerate-api.com](https://www.exchangerate-api.com/). Without it, the app uses the open endpoint (rate-limited) and built-in fallback rates.

2. **Provider** is already wrapped in `components/providers/Providers.tsx` (around CartProvider). No extra setup.

3. **Header**: Currency selector is in `LuxuryHeader` (next to Search). Non-admin routes only (ConditionalHeader hides on `/admin`).

## Usage

### Display a price (storefront)

- **Component**: Use `<FormattedPrice value={product.price} />` (optional: `originalValue`, `showOriginal`, `className`).
- **Hook**: `const formatPrice = useFormattedPrice();` then `formatPrice(pesewas)` for strings (e.g. in aria-labels, totals).

### Admin / backend

- Keep using `formatPrice` from `@/lib/utils` for raw GHS display (e.g. admin tables, order totals in GHS).

### Change currency

- User selects from the header dropdown; choice is persisted in `localStorage` under `edk_currency`.

## API

- **GET `/api/currency/rates`**  
  Returns `{ base: "GHS", rates: { USD: 0.052, ... }, source: "api" | "fallback", updatedAt }`.  
  Response is cached (e.g. 1 hour) via `Cache-Control`.

## Fallback rates

If the rates API fails or is unavailable, `lib/currency/constants.ts` defines `FALLBACK_RATES_GHS`. Update these periodically (e.g. from [exchangerate-api.com](https://www.exchangerate-api.com/)) so offline/error states still show sensible conversions.

## Attribution (open endpoint)

If you do **not** set `EXCHANGE_RATE_API_KEY`, the app uses the open endpoint and you should add attribution, e.g. in the footer:

```html
<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates by Exchange Rate API</a>
```

## Tests

- Unit tests for conversion and formatting: `tests/currency.test.ts`.
- Run (if Jest is configured with `@/` path alias): `npx jest tests/currency.test.ts`

## Optional improvements

- **Geo detection**: Use Vercel geo or a small IP→country API to suggest currency (e.g. default to USD for US visitors) without blocking render.
- **Structured data**: Keep `price` in GHS in JSON-LD for SEO; use a separate `priceDisplay` or client-only rendering for converted amounts.
- **Checkout**: Orders are still stored in GHS; payment providers (e.g. Paystack/MoMo) can stay in GHS. Display-only conversion keeps accounting simple.

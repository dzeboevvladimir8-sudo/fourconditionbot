# FourCondition website

Static site for [fourcondition.app](https://fourcondition.app/) (GitHub Pages). The product is the Telegram bot [@FourConditionBot](https://t.me/FourConditionBot).

- `style.css` — shared design system (brand tokens: navy `#0b1724`, cream `#f4ecdc`, coral `#f26b5b`; Geist / Geist Mono; buttons, panels, nav, footer, doc pages).
- `site.js` — cookie consent + Plausible, sticky nav and mobile menu, one-shot reveals, product micro-loops.
- `index.html` — homepage. Monthly performance reports load from the bot API (`/articles`) and show an empty state until reports exist.
- `upgrade/`, `success/` — plans and checkout flow (Lemon Squeezy URLs are placeholders until merchant approval).
- `terms/`, `privacy/`, `refunds/`, `risk/` — legal pages.
- `og.png` — 1200×630 social image.

Methodology copy mirrors `check_signal` in the bot's `scheduler.py`: price < SMA(20), RSI(14) under threshold, OBV rising over 5 sessions, price within 2% of the lower Bollinger Band (20, 2σ), then the risk filters.

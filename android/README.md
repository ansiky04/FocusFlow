# FocusFlow Android Mobile Companion — Step 1 Architecture

This directory contains the Android Mobile Companion for FocusFlow. It extends the existing FocusFlow ecosystem so the same Focus Session, blocked website rules, and Focus Shield status seamlessly synchronize across:

1. **Desktop / Laptop** (via the existing Chrome Extension)
2. **Android Mobile Companion** (via native Android API integration & VpnService)

---

## 1. Single Source of Truth
Both Desktop Chrome Extension and Android App connect to the same FocusFlow Render Backend (`https://focusflow-api-aazl.onrender.com/api`) and MongoDB database:

```
                      User Account / JWT Token
                                 │
                ┌────────────────┴────────────────┐
                │   FocusFlow Render Backend API  │
                └────────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
    ┌────────────▼────────────┐     ┌────────────▼────────────┐
    │ Desktop Chrome Extension│     │ Android Mobile App      │
    │  DeclarativeNetRequest  │     │  VpnService (Local DNS) │
    └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Reused APIs
- `POST /api/auth/login` — Account authentication.
- `POST /api/auth/register` — User registration.
- `GET /api/auth/me` — User profile details.
- `GET /api/sessions/active` — Active focus session state and countdown sync.
- `POST /api/sessions/start` — Start focus session.
- `PUT /api/sessions/active` — Update session state (pause/resume/stop).
- `GET /api/block-sites` — Blocked domain list sync.

---

## 3. Android VpnService Device Blocking Blueprint (Step 2)
In Android OS, web applications cannot block system-wide navigation. Android's official native mechanism for system-level domain blocking is `android.net.VpnService`.

- **`FocusShieldVpnService`** creates a lightweight local TUN loopback interface (`10.0.0.2`).
- Local DNS queries on port 53 are checked against `BlockSite` domain rules.
- Matched blocked domains return `127.0.0.1`, effectively blocking distracting websites across ALL Android browsers and apps.
- Unblocked traffic passes through standard network gateways with zero performance overhead.

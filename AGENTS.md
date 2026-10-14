# ChainDepo Frontend Agent Instructions

ChainDepo is a blockchain-verified logistics tracking platform.
This Next.js app was migrated from the Nestar real-estate frontend.
Backend: ../chaindepo (NestJS GraphQL), running at http://localhost:3007/graphql

## Read First

- ../chaindepo/docs/BACKEND_MIGRATION.md (GraphQL operations and types)
- ../chaindepo/docs/FRONTEND_MIGRATION.md
- ../chaindepo/docs/DECISIONS.md

## Stack

- Next.js 14 Pages Router, TypeScript, Apollo Client
- MUI + SCSS (existing pages), Tailwind CSS (new pages: home, track, shipment)
- Package manager: yarn (never npm, never create package-lock.json)

## Domain

- Shipment replaces Property; Carrier replaces Agent
- Roles: USER (shipper), CARRIER, ADMIN
- TrackingEvent: SHA-256 hash chain (prevHash -> eventHash), anchored on Ethereum Sepolia (eventTxHash)
- Sepolia contract: 0xF23A90A6e2C5ebB56799044B453DdbfeDD6d1246
- Etherscan: https://sepolia.etherscan.io

## Design

- Light and calm: white background #FFFFFF, section background #F5F7F9, white cards with a 1px border #E3E8EE, radius 6px, almost no shadow
- Text navy #0B2236, secondary #5A6B7B; accent teal-blue #2F8FB5 for buttons and links (hover #26789A)
- Status colors: verified/delivered #1E8E5A, in transit #E0A100, broken/cancelled #C62828
- Font: Inter for everything (next/font/google), JetBrains Mono only for tracking codes and hashes
- Tokens live in tailwind.config.js (preflight off, content limited to the new Tailwind folders)
- Large real photography (ports, containers, trucks in Korea) from Unsplash via next/image, no logos on photos
- Logo: lowercase "chaindepo" in Inter Bold after a small solid #2F8FB5 square (libs/components/ui/Logo.tsx)
- Motion: CSS transitions under 200ms, respect prefers-reduced-motion, no framer-motion
- No gradients, no glow, no dark hero, no orange, max one small uppercase label per page, no fake statistics, no real company names
- Prices in KRW (₩, no decimals) via formatKRW in libs/utils.ts
- Responsive desktop and mobile

## Rules

- Preserve the existing folder structure (pages, libs/components, apollo, scss)
- Make a plan before any multi-file change; small incremental changes
- Never read or modify .env files
- Never run git add, git commit or git push; the user commits
- Ask before installing packages
- Ignore node_modules/ and .next/

## Validation After Each Phase

- yarn tsc --noEmit
- yarn build

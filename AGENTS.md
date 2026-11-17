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

- Bright and editorial (reference: salmon.ph's layout language, with ChainDepo's own content and blue): light by default (dark only via the header toggle), white #FFFFFF and #F5F7F9 sections alternating, hero on #F2F3F5
- Big, tight headlines: text-display (hero) and text-section (home section titles), Manrope ExtraBold, letter-spacing about -0.035em
- Pill buttons (rounded-full): solid accent for the main action, 1.5px ink outline for secondary; large rounded cards (20-28px) without borders
- Text ink #131416, secondary #6A6D71; accent bright blue #2F7BFF for buttons and links (hover #1A65E6)
- Home: hero carousel (pause ring, prev/next, dots), photo cards with a colour wash at the top, one near-black band with the live 3D hash chain (libs/components/home/ChainScene.tsx, three.js)
- Status colors: verified/delivered #1E8E5A, in transit #E0A100, broken/cancelled #C62828
- Font: Manrope for the Tailwind UI (--font-sans), Inter stays on the legacy MUI pages, JetBrains Mono only for tracking codes and hashes
- Tokens live in tailwind.config.js (preflight off, content limited to the new Tailwind folders)
- Large real photography (ports, containers, trucks in Korea) from Unsplash via next/image, no logos on photos
- Logo: a parcel mark with an accent "verified" check badge, then lowercase "chaindepo" in Manrope ExtraBold (libs/components/ui/Logo.tsx; static files in public/logo/ and public/favicon.svg)
- Motion: short CSS transitions, scroll reveal (libs/components/ui/Reveal.tsx), slide crossfades; always respect prefers-reduced-motion; no framer-motion
- Gradients only as a colour wash over photos or a fade into the page colour; no glow, no orange, no fake statistics, no real company names
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

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

- Dark navy #0A1628, accent orange #FF7A1A, white text
- Headings: bold condensed (Barlow Condensed), body: Inter, hashes and tracking codes: JetBrains Mono
- No teal/purple, no glow blobs, no gradients behind text, no fake numbers, no real company names
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

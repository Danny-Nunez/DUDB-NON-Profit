# Dominicanos Unidos Baltimore Website

Dominicanos Unidos Baltimore is a non-profit organization dedicated to empowering the Dominican community across the greater Baltimore area. This web application highlights our mission, showcases local businesses, promotes upcoming cultural programming, and provides an accessible way for neighbors, partners, and donors to get involved.

## ✨ Mission

We exist to:

- Unite Dominican families, entrepreneurs, and youth through inclusive programming.
- Preserve and celebrate Dominican art, music, cuisine, and traditions.
- Provide resources that nurture economic growth, education, and community wellness.

## 🌐 Live Experience

> Coming soon — check back for deployment details.

## 📂 Project Overview

| Section | Description |
| --- | --- |
| `Home` | Hero video, organizational overview, pillars of impact, newsletter sign-up. |
| `About` | Mission, vision, history, and board of directors profile. |
| `Businesses` | Directory of Dominican-owned businesses with descriptions and categories. |
| `Events` | Upcoming and past community events. |
| `Donate` | Giving tiers, value proposition, and CTA for financial support. |
| `Contact` | Contact form, organizational contact details, and language toggle. |

The interface is bilingual, allowing visitors to switch between English and Spanish content on every page.

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS + custom utility classes
- **Routing:** React Router
- **Icons:** Heroicons & inline SVG
- **Language Support:** Custom React context to provide English/Spanish translations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- AWS credentials with access to the `dominicanos-unidos` S3 bucket

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000/` to view the app. The development server also serves `/api/events`, which proxies requests to your S3 bucket using the credentials in `.env.local`.

> Tip: `npx vercel dev` emulates both the Vite build and the serverless API if you prefer using Vercel’s tooling locally.

### Build for Production

```bash
npm run build
```

### DynamoDB Setup (one-time)

After configuring your AWS credentials, create the content table:

```bash
npm run create:table
```

This script provisions a table named `dominicanos_unidos_content` (or the value in `DYNAMODB_TABLE_NAME`) with `PK` and `SK` as the primary keys.

## 🤝 Contributing

We welcome contributions that strengthen our mission. Reach out via the contact form or submit a pull request with improvements. Please open an issue for significant changes so we can discuss your ideas.

## 📬 Stay Connected

- Website: _coming soon_
- Email: `info@dominicanosunidos.org`
- Facebook: `facebook.com/dominicanosunidos`
- Instagram: `instagram.com/dominicanosunidos`
- Twitter/X: `twitter.com/dominicanosunidos`

## 📝 License

This project is maintained by Dominicanos Unidos Baltimore. All rights reserved. For partnership or licensing inquiries, please contact `info@dominicanosunidos.org`.

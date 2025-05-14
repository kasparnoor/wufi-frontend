# Wufi Storefront

Wufi is a modern, subscription-based pet e-commerce platform inspired by Chewy.com, tailored for the Estonian market. This is the customer-facing storefront, built for performance, accessibility, and a seamless shopping experience.

## Project Overview

- **Localized for Estonia**: All flows and content are tailored for the Estonian market.
- **Subscription-first**: Built to support recurring pet product subscriptions as well as one-time purchases.
- **Modern UX**: Fast, responsive, and accessible UI with a custom design system.
- **Full-featured e-commerce**: Product catalog, collections, categories, cart, checkout, user accounts, order history, and more.
- **Secure payments**: Stripe integration for safe and reliable checkout.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Medusa JS SDK](https://docs.medusajs.com/js-client/overview/)
- [Stripe](https://stripe.com/) (checkout)
- [i18next](https://www.i18next.com/) (internationalization)

## Folder Structure

```
wufi-pood-storefront/
├── src/
│   ├── app/                # Next.js app directory (routes, layouts, pages)
│   ├── modules/            # UI and business logic modules (cart, products, account, etc.)
│   ├── lib/                # Data fetching, utilities, helpers
│   ├── styles/             # Tailwind and global styles
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind CSS config
├── next.config.js          # Next.js config
└── ...
```

## Main Features

- **Product Catalog**: Browse products, categories, and collections
- **Cart**: Add, remove, and update items
- **Checkout**: Secure checkout with Stripe
- **User Accounts**: Sign up, sign in, view and manage orders
- **Order History**: See past orders and their status
- **Subscriptions**: (Planned/ongoing) Manage recurring deliveries
- **Localization**: Estonian market focus, i18n-ready
- **Responsive Design**: Mobile-first, works on all devices
- **Performance**: Optimized images, code splitting, and caching
- **Accessibility**: Semantic HTML, proper contrast, ARIA labels

## Getting Started

### 1. Prerequisites
- Node.js 20+
- Yarn (recommended)
- A running [Wufi Medusa backend](../wufi-pood/README.md) (default: http://localhost:9000)

### 2. Setup

Copy the environment template and fill in required values:

```sh
cp .env.template .env.local
```

Install dependencies:

```sh
yarn
```

### 3. Run the Development Server

```sh
yarn dev
```

The site will be running at [http://localhost:8000](http://localhost:8000)

### 4. Payment Integrations

By default, Stripe is supported. Add your Stripe public key to `.env.local`:

```
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-public-key>
```

You must also configure Stripe in your Medusa backend. See the [Medusa docs](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe#main) for details.

## Resources
- [Wufi Backend (Medusa)](../wufi-pood/README.md)
- [Medusa Documentation](https://docs.medusajs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

---

For questions or contributions, please open an issue or pull request!

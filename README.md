# Smart Product Price Tracker

![Price Tracker Preview](https://img.shields.io/badge/Status-Active-success) ![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) 

A modern, automated Next.js web application designed to help users track e-commerce product prices and receive instant email alerts when prices drop. This project features a clean "Modern Soft UI" aesthetic utilizing subtle glassmorphism and satisfying, fluid Framer Motion animations.

## 🚀 Key Features

* **Automated Price Tracking**: Simply paste a product URL (Amazon, Walmart, etc.) and the system will actively monitor the item's cost.
* **Instant Email Alerts**: Powered by **Resend**, users receive beautifully formatted email notifications the moment a product drops below their tracking threshold.
* **Intelligent Scraping**: Leverages the **Firecrawl** API to accurately parse dynamic product metadata and pricing structures across multiple major web retailers.
* **Automated Cron Jobs**: Uses **Supabase pg_cron** and backend API routes to automatically check active tracked links every day without manual user intervention.
* **Authentication**: Seamlessly gated behind Google OAuth logic, enabling individual user profiles via Supabase Auth so you can manage your personalized tracking dashboard.
* **Modern UI**: Constructed with Tailwind CSS v4, Radix UI primitives, and Framer Motion for a fluid, accessible, and highly aesthetic interface.

## 💻 Tech Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS v4, Framer Motion
* **Backend Tools**: Next.js Server Actions, Next.js API Routes
* **Database & Auth**: Supabase (PostgreSQL, Edge Functions, OAuth)
* **Scraping Engine**: Firecrawl JS SDK
* **Email Provider**: Resend SDK
* **UI Components**: Shadcn / Radix UI, Recharts (for price history visualization)

## 🛠️ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/ABHISHEK-ADIGA/smart-product-price-tracker.git
cd smart-product-price-tracker
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the project with the necessary API keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Auth OAuth Redirect
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Scraping Service
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Email Notification Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### 3. Setup Supabase Database
Using the Supabase SQL editor, establish the required `products` tracking tables, and ensure your `pg_cron` extension is enabled to ping your application's `/api/cron/check-prices` route daily.

### 4. Run Locally
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## ☁️ Deployment

This project is fully optimized for **Vercel** deployment.
1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Supply the production environment variables inside the Vercel Dashboard.
4. Ensure your **Supabase Google OAuth Redirect URIs** are updated from `localhost:3000` to your live Vercel domain to ensure authentication continues to function.

---
*Built with ❤️ for a modern web experience.*

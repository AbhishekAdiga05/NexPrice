# Smart Product Price Tracker

![Price Tracker Preview](https://img.shields.io/badge/Status-Active-success) ![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?logo=tailwind-css&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) 

AI-powered e-commerce price intelligence platform with automated monitoring, intelligent purchase recommendations, trend analysis, and personalized alerts.

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

### 3. Environment Variables
Duplicate `.env.example` into `.env.local` or define the following:
```env
# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# SUPABASE OAUTH / LOCAL DEV
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WEB SCRAPING INTELLIGENCE
FIRECRAWL_API_KEY=your_firecrawl_api_key

# TRANSACTIONAL EMAIL PROVIDER
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

### 4. Database Initialization
Run the following SQL inside your Supabase SQL Editor to build the schemas and secure them:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  currency TEXT DEFAULT '$',
  current_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

CREATE TABLE price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure the Database to prevent unauthorized access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only select their own data" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own data" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own data" ON products FOR DELETE USING (auth.uid() = user_id);
```

### 5. Launch the App
```bash
npm run dev
```

---

## ⚙️ Automation & Cron Jobs

NexPrice relies on `pg_cron` inside PostgreSQL to run a scheduled background job, meaning you do not have to pay for an external scheduler service (like Vercel Cron). 

Execute this in Supabase to start the midnight price-checking loop:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'daily-price-scraper',
  '0 0 * * *', -- Runs exactly at midnight UTC
  $$
    SELECT net.http_post(
        url:='https://YOUR_PRODUCTION_DOMAIN/api/cron/check-prices',
        headers:='{"Content-Type": "application/json"}'::jsonb
    )
  $$
);
```
*(⚠️ Ensure you change `YOUR_PRODUCTION_DOMAIN` to your live Vercel URL, or `ngrok` URL during local testing).*

---

## 🌐 Deployment Guide

This app is tailor-made for seamless deployment on **Vercel**.
1. Push your stable `main` branch to GitHub.
2. Initialize a new project in Vercel and import the repository.
3. Add all your keys from `.env.local` to the Vercel **Environment Variables** dashboard.
4. Finalize the deployment.
5. **Critical Auth Step**: Log into Supabase > Authentication > URL Configuration. Update your Site URL and Redirect URIs to match your new `https://project.vercel.app` string. Do the same inside Google Cloud Console if using Google OAuth.

---

<p align="center">
  <i>Developed and designed by Abhishek Adiga to redefine automated e-commerce tooling.</i>
</p>

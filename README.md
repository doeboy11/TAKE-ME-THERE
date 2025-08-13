# TAKE-ME-THERE

A Next.js + TypeScript app for local business discovery. Users can search, filter, and view business details with images, reviews, and lightweight analytics. Business data and images are stored in Supabase.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Supabase (database, storage, auth)
- Tailwind-based UI components
- Lucide icons

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

2. Create environment variables in a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the dev server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open http://localhost:3000

## Project Structure
- `app/` — Next.js routes and pages
  - `page.tsx` — Main search and listing UI
  - `business/[id]/page.tsx` — Business detail page
  - `layout.tsx` — Global layout and providers
- `components/` — Reusable UI and feature components
- `lib/business-store.ts` — Central data layer to fetch businesses, reviews, and analytics
- `middleware.ts` — Guards admin routes using Supabase session

## Key Features
- Fetch approved businesses and normalize images (`images` array + primary `image`)
- Search and filter by category, rating, and distance
- Business details with gallery and reviews
- Lightweight analytics: track business views and contacts

## Environment Notes
- Ensure your Supabase Storage has a public bucket for business images.
- The app resolves image URLs using a few common bucket names (`business-images`, `public`, `images`). Adjust in `lib/business-store.ts` if needed.
- RLS policies should allow reading approved businesses publicly and allow authenticated actions where required (e.g., posting reviews).

## Scripts
- `dev` — Start dev server
- `build` — Build for production
- `start` — Start production server
- `lint` — Lint the codebase

## Contributing
1. Create a feature branch.
2. Commit changes with clear messages.
3. Open a pull request against `main`.

## License
MIT

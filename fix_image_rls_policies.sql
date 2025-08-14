-- Fix RLS policies for business image uploads
-- This addresses the issue where images upload to Storage but don't persist in the database

-- Enable RLS on both tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "owner select businesses" ON public.businesses;
DROP POLICY IF EXISTS "owner select images" ON public.business_images;
DROP POLICY IF EXISTS "owner insert images" ON public.business_images;
DROP POLICY IF EXISTS "owner update images" ON public.business_images;
DROP POLICY IF EXISTS "owner delete images" ON public.business_images;

-- PUBLIC POLICIES (for approved businesses)
-- Allow public/anon to read approved businesses
CREATE POLICY "public select approved businesses"
ON public.businesses
FOR SELECT
TO anon, authenticated
USING (approval_status = 'approved');

-- Allow public/anon to read images of approved businesses
CREATE POLICY "public select approved business images"
ON public.business_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND b.approval_status = 'approved'
  )
);

-- OWNER POLICIES (for pending/own businesses)
-- Allow owners to read their own businesses (any status)
CREATE POLICY "owner select businesses"
ON public.businesses
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR "ownerId" = auth.uid()
);

-- Allow owners to read their own business images (any status)
CREATE POLICY "owner select images"
ON public.business_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
  )
);

-- Allow owners to insert images for their businesses
CREATE POLICY "owner insert images"
ON public.business_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
  )
);

-- Allow owners to update their business images
CREATE POLICY "owner update images"
ON public.business_images
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
  )
);

-- Allow owners to delete their business images
CREATE POLICY "owner delete images"
ON public.business_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_images.business_id
      AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
  )
);

-- Allow owners to insert/update their own businesses
CREATE POLICY "owner insert businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() OR "ownerId" = auth.uid());

CREATE POLICY "owner update businesses"
ON public.businesses
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() OR "ownerId" = auth.uid())
WITH CHECK (owner_id = auth.uid() OR "ownerId" = auth.uid());

-- Allow owners to delete their own businesses
CREATE POLICY "owner delete businesses"
ON public.businesses
FOR DELETE
TO authenticated
USING (owner_id = auth.uid() OR "ownerId" = auth.uid());

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('businesses', 'business_images')
ORDER BY tablename, policyname;

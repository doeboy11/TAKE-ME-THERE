-- Minimal fix for image upload persistence issue
-- Only adds the missing owner INSERT policy for business_images

-- First, check what policies currently exist
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('businesses', 'business_images')
ORDER BY tablename, policyname;

-- The core issue: owners need to INSERT images for their businesses
-- Try to create the policy, but handle if it already exists
DO $$
BEGIN
    -- Try to create the owner insert policy
    BEGIN
        CREATE POLICY "owner insert images for new business"
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
        RAISE NOTICE 'Created owner insert policy for business_images';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Owner insert policy already exists, trying to alter it';
        -- If it exists, try to alter it to ensure it has the right predicate
        ALTER POLICY "owner insert images"
        ON public.business_images
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.businesses b
            WHERE b.id = business_images.business_id
              AND (b.owner_id = auth.uid() OR b."ownerId" = auth.uid())
          )
        );
    END;

    -- Also ensure owners can SELECT their businesses (needed for the join)
    BEGIN
        CREATE POLICY "owner select own businesses"
        ON public.businesses
        FOR SELECT
        TO authenticated
        USING (owner_id = auth.uid() OR "ownerId" = auth.uid());
        RAISE NOTICE 'Created owner select policy for businesses';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Owner select policy for businesses already exists';
        -- Try to alter existing policy
        ALTER POLICY "owner select businesses"
        ON public.businesses
        USING (owner_id = auth.uid() OR "ownerId" = auth.uid());
    END;

    -- Ensure owners can INSERT businesses too
    BEGIN
        CREATE POLICY "owner insert own businesses"
        ON public.businesses
        FOR INSERT
        TO authenticated
        WITH CHECK (owner_id = auth.uid() OR "ownerId" = auth.uid());
        RAISE NOTICE 'Created owner insert policy for businesses';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Owner insert policy for businesses already exists';
    END;
END$$;

-- Enable RLS if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

-- Final verification - show all policies
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('businesses', 'business_images')
ORDER BY tablename, policyname;

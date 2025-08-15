-- =====================================================
-- COMPLETE IMAGE UPLOAD SYSTEM SETUP
-- Run this in Supabase SQL Editor to enable image uploads
-- =====================================================

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for storage bucket (with conflict handling)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own business images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own business images" ON storage.objects;

-- Allow authenticated users to upload images only to a path they own: `${auth.uid()}/...`
CREATE POLICY "Allow authenticated users to upload business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-images' AND
  (name LIKE auth.uid()::text || '/%')
);

-- Allow public read access to business images
CREATE POLICY "Allow public read access to business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Allow users to delete only their own uploaded images (path must start with their UID)
CREATE POLICY "Allow users to delete their own business images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-images' AND
  (name LIKE auth.uid()::text || '/%')
);

-- Allow users to update only their own uploaded images (path must start with their UID)
CREATE POLICY "Allow users to update their own business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-images' AND
  (name LIKE auth.uid()::text || '/%')
);

-- 3. Ensure business_images table exists with proper structure
CREATE TABLE IF NOT EXISTS business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) DEFAULT 'gallery' CHECK (image_type IN ('logo', 'gallery', 'banner', 'featured')),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    file_size INTEGER,
    file_type VARCHAR(50),
    dimensions VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'business_images_business_id_fkey'
    ) THEN
        ALTER TABLE business_images 
        ADD CONSTRAINT business_images_business_id_fkey 
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_images_business_id ON business_images(business_id);
CREATE INDEX IF NOT EXISTS idx_business_images_is_primary ON business_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_business_images_sort_order ON business_images(sort_order);

-- 6. Enable RLS on business_images table
ALTER TABLE business_images ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for business_images table (with conflict handling)
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access to business images" ON business_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert business images" ON business_images;
DROP POLICY IF EXISTS "Allow business owners to update their images" ON business_images;
DROP POLICY IF EXISTS "Allow business owners to delete their images" ON business_images;

-- Allow public to read business images
CREATE POLICY "Allow public read access to business images"
ON business_images FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert business images only for their own businesses
CREATE POLICY "Allow authenticated users to insert business images"
ON business_images FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Allow business owners to update their business images
CREATE POLICY "Allow business owners to update their images"
ON business_images FOR UPDATE
TO authenticated
USING (
    business_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid()
    )
);

-- Allow business owners to delete their business images
CREATE POLICY "Allow business owners to delete their images"
ON business_images FOR DELETE
TO authenticated
USING (
    business_id IN (
        SELECT id FROM businesses 
        WHERE owner_id = auth.uid()
    )
);

-- 8. Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_business_images_updated_at ON business_images;
CREATE TRIGGER update_business_images_updated_at
    BEFORE UPDATE ON business_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Ensure only one primary image per business
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If this image is being set as primary, unset all other primary images for this business
    IF NEW.is_primary = true THEN
        UPDATE business_images 
        SET is_primary = false 
        WHERE business_id = NEW.business_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for single primary image
DROP TRIGGER IF EXISTS ensure_single_primary_image_trigger ON business_images;
CREATE TRIGGER ensure_single_primary_image_trigger
    BEFORE INSERT OR UPDATE ON business_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- 12. Grant necessary permissions (RLS will still enforce row policies)
GRANT SELECT, INSERT, UPDATE, DELETE ON business_images TO authenticated;
GRANT SELECT ON business_images TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== IMAGE UPLOAD SYSTEM SETUP COMPLETE ===';
    RAISE NOTICE '✅ Storage bucket "business-images" created';
    RAISE NOTICE '✅ Storage RLS policies configured';
    RAISE NOTICE '✅ business_images table ready';
    RAISE NOTICE '✅ Database RLS policies configured';
    RAISE NOTICE '✅ Indexes and triggers created';
    RAISE NOTICE '🔄 Image upload system is now fully functional!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Deploy your Next.js application';
    RAISE NOTICE '2. Test image upload in business dashboard';
    RAISE NOTICE '3. Verify images appear in storage bucket';
    RAISE NOTICE '4. Check that image URLs are saved to database';
END $$;

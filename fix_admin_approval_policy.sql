-- Grant admins the ability to update approval fields on businesses
-- Uses role claim from JWT: auth.jwt() ->> 'role' = 'admin'

-- Ensure RLS is enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing admin update policy if any
DROP POLICY IF EXISTS "admin update approvals" ON public.businesses;

-- Create admin-only UPDATE policy for approval management
CREATE POLICY "admin update approvals"
ON public.businesses
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Optionally allow admins to SELECT all businesses (if needed for dashboards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'businesses' AND policyname = 'admin select businesses'
  ) THEN
    CREATE POLICY "admin select businesses"
    ON public.businesses
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

-- Show policies for verification
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'businesses'
ORDER BY policyname;

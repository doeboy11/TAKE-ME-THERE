/**
 * Business Store
 * Central data access layer for businesses, images, reviews, and analytics.
 *
 * Responsibilities:
 * - Fetch businesses by status and id, mapping storage image paths to public URLs
 * - Create/update/delete businesses and associated images
 * - Manage reviews (CRUD) and keep business rating/review_count in sync
 * - Lightweight analytics: track and query business views
 *
 * Notes:
 * - Uses Supabase client; in browser contexts prefers an auth-aware client so RLS sees sessions
 * - Image URLs are normalized via getBusinessImageUrl() with safe fallbacks
 */

import { supabase } from './supabaseClient'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Debug: Check if environment variables are loaded
console.log('🔍 Checking Supabase configuration...')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')

export interface Business {
  id: string
  name: string
  category: string
  rating?: number
  reviewCount?: number
  address: string
  phone: string
  hours: string
  distance?: number
  image?: string
  images?: string[]
  description: string
  price_range?: string // Optional, since it may not exist in DB
  lat?: number
  lng?: number
  approval_status: string
  created_at: string
  owner_email: string
  owner_name: string
  email: string
  website?: string
  // Additional fields for comprehensive form
  ownerId?: string
  foundedYear?: string
  employeeCount?: string
  specialties?: string[]
  awards?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  amenities?: string[]
  paymentMethods?: string[]
  languages?: string[]
  accessibility?: boolean
  parking?: boolean
  wifi?: boolean
  aboutCompany?: string
  mission?: string
  services?: string[]
  approvalStatus?: string
  adminNotes?: string
  approvedAt?: string
  approvedBy?: string
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  user_email?: string
  rating: number
  title?: string
  comment?: string
  visit_date?: string
  helpful_votes: number
  created_at: string
  updated_at: string
  user_has_voted?: boolean
  user_vote?: boolean
}

// ==============================
// Image URL Utilities
// ==============================
/**
 * Convert a stored image path or absolute URL into a usable public URL.
 * - If already absolute (http/https), return as-is
 * - Otherwise, try common bucket names and return the first successful public URL
 * - Fallback to placeholder if none works
 */
function getBusinessImageUrl(imageUrl: string): string {
  if (!imageUrl) return "/placeholder.svg";
  // If imageUrl is already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // Try both possible bucket names for robustness
  const bucketNames = ['business-images', 'public', 'images'];
  for (const bucket of bucketNames) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(imageUrl);
    if (data?.publicUrl && data.publicUrl.includes(imageUrl)) {
      console.log(`[ImageURL] Bucket: ${bucket}, imageUrl: ${imageUrl}, publicUrl: ${data.publicUrl}`);
      return data.publicUrl;
    }
  }
  console.warn(`[ImageURL] Could not generate public URL for: ${imageUrl}`);
  return "/placeholder.svg";
}

// ==============================
// Business Store class
// ==============================
class BusinessStore {
  private getSupabaseClient() {
    try {
      return createClientComponentClient()
    } catch {
      return supabase
    }
  }

  /**
   * Create a new business with approval_status='pending' for the current user.
   * Maps form fields to DB columns and returns Supabase-style { data, error, status }.
   */
  async create(input: any): Promise<{ data: any[] | null; error: any; status?: number }> {
    try {
      const supa = this.getSupabaseClient()
      const { data: userData, error: userError } = await supa.auth.getUser()
      if (userError || !userData?.user?.id) {
        return { data: null, error: { message: 'Not authenticated' }, status: 401 }
      }
      const userId = userData.user.id

      // Column mapping
      const row: any = {
        name: input.name,
        category: input.category,
        description: input.description,
        address: input.address,
        phone: input.phone,
        hours: input.hours,
        price_range: input.priceRange || input.price_range || null,
        latitude: input.lat ?? input.latitude ?? null,
        longitude: input.lng ?? input.longitude ?? null,
        website: input.website ?? null,
        email: input.email ?? null,
        owner_email: input.owner_email ?? null,
        owner_name: input.owner_name ?? null,
        approval_status: 'pending',
      }

      // Owner column can be owner_id or ownerId depending on schema; set both defensively
      row.owner_id = userId
      row.ownerId = userId

      const { data, error, status } = await supa
        .from('businesses')
        .insert([row])
        .select('*')

      return { data: (data as any[]) || null, error, status }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update an existing business owned by the current user.
   * Ensures ownership and maps fields similarly to create().
   */
  async update(input: any): Promise<{ data: any[] | null; error: any; status?: number }> {
    try {
      const supa = this.getSupabaseClient()
      const { data: userData, error: userError } = await supa.auth.getUser()
      if (userError || !userData?.user?.id) {
        return { data: null, error: { message: 'Not authenticated' }, status: 401 }
      }
      const userId = userData.user.id

      const id = input.id
      if (!id) return { data: null, error: { message: 'Missing business id' }, status: 400 }

      // Determine owner column by probing once
      let ownerColumn = 'owner_id'
      try {
        const { data: colCheck } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'businesses')
          .in('column_name', ['owner_id', 'ownerId'])
        const names = (colCheck as any[])?.map(c => c.column_name) || []
        ownerColumn = names.includes('owner_id') ? 'owner_id' : (names.includes('ownerId') ? 'ownerId' : 'owner_id')
      } catch {}

      // Only update allowed fields
      const patch: any = {
        name: input.name,
        category: input.category,
        description: input.description,
        address: input.address,
        phone: input.phone,
        hours: input.hours,
        price_range: input.priceRange ?? input.price_range,
        latitude: input.lat ?? input.latitude,
        longitude: input.lng ?? input.longitude,
        website: input.website,
        email: input.email,
        owner_email: input.owner_email,
        owner_name: input.owner_name,
      }

      // Remove undefined keys to avoid overwriting with null unintentionally
      Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])

      const { data, error, status } = await supa
        .from('businesses')
        .update(patch)
        .eq('id', id)
        .eq(ownerColumn as any, userId)
        .select('*')

      return { data: (data as any[]) || null, error, status }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Delete a business that belongs to the currently signed-in owner.
   * Steps:
   * 1) Verify user is signed in and owns the business (supports owner_id or ownerId)
   * 2) Delete related images from Supabase Storage and `business_images` table
   * 3) Delete related reviews
   * 4) Delete the business row
   */
  async delete(businessId: string): Promise<{ error: any }> {
    try {
      const supa = this.getSupabaseClient()

      // 1) Auth check
      const { data: userData, error: userError } = await supa.auth.getUser()
      if (userError || !userData?.user?.id) {
        return { error: { message: 'Not authenticated' } }
      }
      const userId = userData.user.id

      // 2) Load business with owner and image rows
      // Select both owner_id and ownerId to be resilient to column naming
      const { data: biz, error: bizError } = await supa
        .from('businesses')
        .select(`id, owner_id, ownerId, business_images ( image_url )`)
        .eq('id', businessId)
        .single()

      if (bizError || !biz) {
        return { error: bizError || { message: 'Business not found' } }
      }

      const ownerColumn = (biz as any).owner_id ?? (biz as any).ownerId
      if (!ownerColumn || ownerColumn !== userId) {
        return { error: { message: 'Not authorized to delete this business' } }
      }

      // 3) Attempt to delete images from storage first (best-effort)
      const fileNames: string[] = (biz as any).business_images?.map((img: any) => img.image_url).filter(Boolean) || []
      if (fileNames.length > 0) {
        // Ignore storage errors here; table deletions will still proceed
        await this.deleteImages(fileNames)
      }

      // 4) Delete dependent rows (business_images, reviews)
      // If you have ON DELETE CASCADE, these may be optional, but we include for safety with RLS
      await supa.from('business_images').delete().eq('business_id', businessId)
      await supa.from('reviews').delete().eq('business_id', businessId)

      // 5) Delete business
      const { error: deleteError } = await supa.from('businesses').delete().eq('id', businessId)
      if (deleteError) {
        return { error: deleteError }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }
  /**
   * Get all businesses regardless of approval status.
   * Maps storage image paths to public URLs and normalizes lat/lng.
   */
  async getAllBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          category,
          description,
          address,
          phone,
          hours,
          latitude,
          longitude,
          owner_email,
          owner_name,
          email,
          approval_status,
          created_at,
          updated_at,
          business_images (image_url, is_primary)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching businesses:', error)
        return []
      }

      // Transform the data to include images array with public URLs
      const businessesWithImages = (data || []).map((business: any) => {
        const images = business.business_images?.map((img: any) => getBusinessImageUrl(img.image_url)) || [];
        const image = business.business_images?.find((img: any) => img.is_primary)?.image_url;
        return {
          ...business,
          price_range: business.price_range || '',
          lat: business.latitude,
          lng: business.longitude,
          images,
          image: getBusinessImageUrl(image)
        }
      })

      return businessesWithImages
    } catch (error) {
      console.error('Error fetching businesses:', error)
      return []
    }
  }

  /**
   * Get businesses with approval_status === 'approved'.
   * Ensures both `images` (array) and `image` (primary) are present for UI.
   */
  async getApprovedBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          category,
          description,
          address,
          phone,
          hours,
          latitude,
          longitude,
          owner_email,
          owner_name,
          email,
          approval_status,
          created_at,
          updated_at,
          business_images (image_url, is_primary)
        `)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching approved businesses:', error)
        return []
      }

      const businessesWithImages = (data || []).map((business: any) => {
        const images = business.business_images?.map((img: any) => getBusinessImageUrl(img.image_url)) || [];
        const image = business.business_images?.find((img: any) => img.is_primary)?.image_url;
        return {
          ...business,
          price_range: business.price_range || '',
          lat: business.latitude,
          lng: business.longitude,
          images,
          image: getBusinessImageUrl(image)
        };
      });

      return businessesWithImages
    } catch (error) {
      console.error('Error fetching approved businesses:', error)
      return []
    }
  }

  // Get pending businesses (admin views)
  async getPendingBusinesses(): Promise<Business[]> {
    try {
      console.log('🔍 getPendingBusinesses called')
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          category,
          description,
          address,
          phone,
          hours,
          latitude,
          longitude,
          owner_email,
          owner_name,
          email,
          approval_status,
          created_at,
          updated_at,
          business_images (image_url, is_primary)
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending businesses:', error)
        return []
      }

      const businessesWithImages = (data || []).map((business: any) => {
        const images = business.business_images?.map((img: any) => getBusinessImageUrl(img.image_url)) || [];
        const image = business.business_images?.find((img: any) => img.is_primary)?.image_url;
        return {
          ...business,
          price_range: business.price_range || '',
          lat: business.latitude,
          lng: business.longitude,
          images,
          image: getBusinessImageUrl(image)
        };
      });

      console.log('🔍 getPendingBusinesses transformed result:', businessesWithImages)
      return businessesWithImages
    } catch (error) {
      console.error('Error fetching pending businesses:', error)
      return []
    }
  }

  // Get rejected businesses (admin views)
  async getRejectedBusinesses(): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, category, description, address, phone, hours, owner_email, owner_name, email, approval_status, created_at, updated_at')
        .eq('approval_status', 'rejected')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching rejected businesses:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching rejected businesses:', error)
      return []
    }
  }

  /**
   * Get a single business by id, including `images` array and primary `image` URL.
   * Returns `{ data, error }` to mirror Supabase style.
   */
  async getById(id: string): Promise<{ data: Business | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, 
          name, 
          category, 
          description, 
          address, 
          phone, 
          hours, 
          latitude,
          longitude,
          owner_email, 
          owner_name, 
          email, 
          approval_status, 
          created_at, 
          updated_at,
          business_images (image_url, is_primary)
        `)
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error }
      }

      // Transform the data to include images array with public URLs
      const businessWithImages = data ? {
        ...data,
        lat: data.latitude,
        lng: data.longitude,
        images: data.business_images?.map((img: any) => getBusinessImageUrl(img.image_url)) || [],
        image: getBusinessImageUrl(data.business_images?.find((img: any) => img.is_primary)?.image_url || "/placeholder.svg")
      } : null

      return { data: businessWithImages, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get businesses by owner ID (handles owner_id vs ownerId column)
  async getByOwnerId(ownerId: string): Promise<{ data: Business[] | null, error: any }> {
    try {
      console.log('🔍 getByOwnerId called with ownerId:', ownerId)
      
      // First, check which column exists in the database
      const { data: columnCheck, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'businesses')
        .in('column_name', ['owner_id', 'ownerId'])

      let columnName = 'owner_id' // default
      if (!columnError && columnCheck && columnCheck.length > 0) {
        const hasOwnerId = columnCheck.some(col => col.column_name === 'ownerId')
        columnName = hasOwnerId ? 'ownerId' : 'owner_id'
        console.log(`🔍 Using ${columnName} column for query`)
      }

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          category,
          description,
          address,
          phone,
          hours,
          latitude,
          longitude,
          owner_email,
          owner_name,
          email,
          approval_status,
          created_at,
          updated_at,
          business_images (image_url, is_primary)
        `)
        .eq(columnName as any, ownerId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      const businessesWithImages = (data || []).map((business: any) => {
        const images = business.business_images?.map((img: any) => getBusinessImageUrl(img.image_url)) || []
        const image = business.business_images?.find((img: any) => img.is_primary)?.image_url
        return {
          ...business,
          price_range: business.price_range || '',
          lat: business.latitude,
          lng: business.longitude,
          images,
          image: getBusinessImageUrl(image)
        }
      })

      return { data: businessesWithImages, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Reviews methods
  async getReviewsByBusinessId(businessId: string): Promise<{ data: Review[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      return { data: data || [], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_votes'>): Promise<{ data: Review | null, error: any }> {
    try {
      const newReview = {
        ...reviewData,
      created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        helpful_votes: 0
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      // Update business rating and review count
      await this.updateBusinessRating(reviewData.business_id)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async addReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_votes'>): Promise<{ error: any }> {
    const result = await this.createReview(reviewData)
    return { error: result.error }
  }

  async updateReview(reviewId: string, reviewData: Partial<Review>): Promise<{ data: Review | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          ...reviewData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      // Update business rating and review count
      if (data) {
        await this.updateBusinessRating(data.business_id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteReview(reviewId: string): Promise<{ error: any }> {
    try {
      // Get the business ID before deleting
      const { data: review } = await supabase
        .from('reviews')
        .select('business_id')
        .eq('id', reviewId)
        .single()

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        return { error }
      }

      // Update business rating and review count
      if (review) {
        await this.updateBusinessRating(review.business_id)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async voteReview(reviewId: string, userId: string, isHelpful: boolean): Promise<{ error: any }> {
    try {
      // For now, just update helpful votes count
      const { error } = await supabase
        .from('reviews')
        .update({ 
          helpful_votes: supabase.rpc('increment', { 
            row: { helpful_votes: isHelpful ? 1 : -1 } 
          })
        })
        .eq('id', reviewId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    try {
      // Get all reviews for this business
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId)

      if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length

        // Update business rating and review count
        await supabase
          .from('businesses')
          .update({ 
            rating: Math.round(averageRating * 10) / 10,
            review_count: reviews.length
          })
          .eq('id', businessId)
      }
    } catch (error) {
      console.error('Error updating business rating:', error)
    }
  }

  // Mock storage methods for compatibility (for image uploads)
  async uploadImage(fileName: string, file: File): Promise<{ data: { url: string; path: string } | null, error: any }> {
    try {
      const supa = this.getSupabaseClient()
      const bucketCandidates = ['business-images', 'public', 'images']
      let uploadedPath: string | null = null
      const errors: Array<{ bucket: string; message: string }> = []

      for (const bucket of bucketCandidates) {
        const { data, error } = await supa.storage.from(bucket).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: (file as any)?.type || 'application/octet-stream',
        })
        if (!error && data?.path) {
          uploadedPath = data.path
          const { data: pub } = supa.storage.from(bucket).getPublicUrl(uploadedPath)
          if (pub?.publicUrl) {
            return { data: { url: pub.publicUrl, path: uploadedPath }, error: null }
          }
          // If no public URL, continue trying next bucket but record info
          errors.push({ bucket, message: 'Public URL generation failed' })
          continue
        }
        errors.push({ bucket, message: (error as any)?.message || 'Unknown storage error' })
      }

      const combined = errors.map(e => `${e.bucket}: ${e.message}`).join('; ')
      return { data: null, error: { message: combined || 'Upload failed' } }
    } catch (error) {
      const message = (error as any)?.message || 'Upload failed'
      return { data: null, error: { message } }
    }
  }

  getPublicUrl(fileName: string): { data: { publicUrl: string } | null } {
    if (!fileName) return { data: null }
    const supa = this.getSupabaseClient()
    const bucketCandidates = ['business-images', 'public', 'images']
    for (const bucket of bucketCandidates) {
      const { data } = supa.storage.from(bucket).getPublicUrl(fileName)
      if (data?.publicUrl) return { data: { publicUrl: data.publicUrl } }
    }
    return { data: null }
  }

  async deleteImage(fileName: string): Promise<{ error: any }> {
    try {
      const supa = this.getSupabaseClient()
      const bucketCandidates = ['business-images', 'public', 'images']
      for (const bucket of bucketCandidates) {
        const { error } = await supa.storage.from(bucket).remove([fileName])
        if (!error) return { error: null }
      }
      return { error: { message: 'Failed to delete image from all buckets' } }
    } catch (error) {
      return { error }
    }
  }

  async deleteImages(fileNames: string[]): Promise<{ error: any }> {
    try {
      const supa = this.getSupabaseClient()
      const bucketCandidates = ['business-images', 'public', 'images']
      for (const bucket of bucketCandidates) {
        const { error } = await supa.storage.from(bucket).remove(fileNames)
        if (!error) return { error: null }
      }
      return { error: { message: 'Failed to delete images from all buckets' } }
    } catch (error) {
      return { error }
    }
  }

  // ==============================
  // Analytics: Views & Contacts
  // ==============================
  private getOrCreateSessionId(): string {
    try {
      if (typeof window === 'undefined') return ''
      const storageKey = 'tmt_session_id'
      const existing = window.localStorage.getItem(storageKey)
      if (existing) return existing
      const generated = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      window.localStorage.setItem(storageKey, generated)
      return generated
    } catch {
      return ''
    }
  }

  async trackView(
    businessId: string,
    source: 'search' | 'category' | 'map' | 'direct' | 'social' | 'referral' = 'direct'
  ): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id || null
      const sessionId = this.getOrCreateSessionId()
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined

      await supabase.from('business_views').insert([
        {
          business_id: businessId,
          user_id: userId,
          session_id: sessionId || null,
          user_agent: userAgent || null,
          source,
        },
      ])
    } catch (error) {
      console.warn('trackView failed (non-blocking):', error)
    }
  }

  async trackContact(
    businessId: string,
    contactType: 'phone' | 'website' | 'directions' | 'email'
  ): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id || null
      const sessionId = this.getOrCreateSessionId()

      await supabase.from('business_contacts').insert([
        {
          business_id: businessId,
          user_id: userId,
          session_id: sessionId || null,
          contact_type: contactType,
        },
      ])
    } catch (error) {
      console.warn('trackContact failed (non-blocking):', error)
    }
  }

  async getBusinessViewsForOwner(ownerId: string): Promise<
    { id: string; business_id: string; user_id: string | null; session_id: string | null; user_agent: string | null; viewed_at: string; business: { id: string; name: string } }[]
  > {
    try {
      // Join views with businesses, filter by owner
      const { data, error } = await supabase
        .from('business_views')
        .select(
          `id, business_id, user_id, session_id, user_agent, viewed_at,
           businesses!inner ( id, name, owner_id )`
        )
        .eq('businesses.owner_id', ownerId)
        .order('viewed_at', { ascending: false })

      if (error || !data) return []

      // Remap to a cleaner shape
      const mapped = (data as any[]).map((row) => ({
        id: row.id,
        business_id: row.business_id,
        user_id: row.user_id ?? null,
        session_id: row.session_id ?? null,
        user_agent: row.user_agent ?? null,
        viewed_at: row.viewed_at,
        business: {
          id: row.businesses?.id,
          name: row.businesses?.name,
        },
      }))

      return mapped
    } catch (error) {
      console.error('Error fetching owner views:', error)
      return []
    }
  }

  async getBusinessViews(businessId: string): Promise<
    { id: string; user_id: string | null; session_id: string | null; user_agent: string | null; viewed_at: string }[]
  > {
    try {
      const { data, error } = await supabase
        .from('business_views')
        .select('id, user_id, session_id, user_agent, viewed_at')
        .eq('business_id', businessId)
        .order('viewed_at', { ascending: false })

      if (error || !data) return []
      return data as any
    } catch (error) {
      console.error('Error fetching business views:', error)
      return []
    }
  }

  // Reset to initial data (for testing)
  async reset(): Promise<void> {
    try {
      // Clear all data from Supabase
      await supabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    } catch (error) {
      console.error('Error resetting data:', error)
    }
  }

  // Test Supabase connection and configuration
  async testConnection(): Promise<{ success: boolean, error?: string, details?: any }> {
    try {
      console.log('🔍 Testing Supabase connection...')
      
      // Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('🔍 Environment check:', {
        url: url ? 'Set' : 'Missing',
        key: key ? 'Set' : 'Missing',
        urlLength: url?.length || 0,
        keyLength: key?.length || 0
      })
      
      if (!url || !key) {
        return {
          success: false,
          error: 'Missing environment variables',
          details: { url: !!url, key: !!key }
        }
      }
      
      // Test basic connection
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error)
        return {
          success: false,
          error: error.message || 'Connection failed',
          details: error
        }
      }
      
      console.log('✅ Supabase connection successful!')
      return {
        success: true,
        details: { dataCount: data?.length || 0 }
      }
      
    } catch (error) {
      console.error('❌ Connection test exception:', error)
      return {
        success: false,
        error: (error as any)?.message || 'Unknown error',
        details: error
      }
    }
  }

  // Test table structure
  async testTableStructure(): Promise<{ success: boolean, error?: string, details?: any }> {
    try {
      console.log('🔍 Testing table structure...')
      
      // Try to select from the table
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, approval_status')
        .limit(1)
      
      if (error) {
        console.error('❌ Table structure error:', error)
        return {
          success: false,
          error: error.message,
          details: error
        }
      }
      
      console.log('✅ Table exists and is accessible')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Exception testing table structure:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    }
  }
}

// Create singleton instance
export const businessStore = new BusinessStore() 
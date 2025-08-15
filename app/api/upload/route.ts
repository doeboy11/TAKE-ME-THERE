import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr) {
      console.error('Auth getUser error:', userErr)
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessId = formData.get('businessId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Enforce RLS by prefixing with the authenticated user's ID
    const objectKey = `${user.id}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('business-images')
      .upload(objectKey, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('business-images')
      .getPublicUrl(objectKey)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      )
    }

    // If businessId is provided, save to business_images table
    if (businessId) {
      const { error: dbError } = await supabase
        .from('business_images')
        .insert({
          business_id: businessId,
          image_url: urlData.publicUrl,
          is_primary: false,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        // Don't fail the request if DB insert fails, image is still uploaded
      }
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: objectKey,
      fileName: fileName,
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const url = searchParams.get('url')
    const fileName = searchParams.get('fileName')

    // Derive objectKey
    let objectKey: string | null = null
    if (path) {
      objectKey = path
    } else if (url) {
      // Convert public URL to storage path
      const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-images/`
      if (url.startsWith(prefix)) {
        objectKey = url.substring(prefix.length)
      }
    } else if (fileName) {
      // Backwards compatibility: assume user's own file
      objectKey = `${user.id}/${fileName}`
    }

    if (!objectKey) {
      return NextResponse.json({ error: 'No valid path/url/fileName provided' }, { status: 400 })
    }

    // Ensure the object belongs to the requesting user (RLS safety)
    if (!objectKey.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden: cannot delete other users\' files' }, { status: 403 })
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('business-images')
      .remove([objectKey])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete image', details: deleteError.message },
        { status: 500 }
      )
    }

    // Also remove from business_images table (best-effort)
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-images/${objectKey}`
    await supabase
      .from('business_images')
      .delete()
      .eq('image_url', publicUrl)

    return NextResponse.json({ success: true, path: objectKey })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

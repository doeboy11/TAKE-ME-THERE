"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { businessStore, Review } from "@/lib/business-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, ThumbsDown, Calendar, User, Edit, Trash2, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BusinessReviewsProps {
  businessId: string
  businessName: string
  currentRating: number
  reviewCount: number
}

export function BusinessReviews({ businessId, businessName, currentRating, reviewCount }: BusinessReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    visit_date: "",
  })

  // ------------------------------------------------------------
  // Fetch Reviews for a Business (loads on mount and when user changes)
  // ------------------------------------------------------------
  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      // Await the async store call and handle its result
      const { data: reviewsData, error: reviewsError } = await businessStore.getReviewsByBusinessId(businessId)

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
        return
      }

      const reviewsWithUserInfo = reviewsData?.map(review => ({
        ...review,
        user_email: user?.email || 'Anonymous',
        user_has_voted: false,
        user_vote: undefined
      })) || []

      setReviews(reviewsWithUserInfo)

      // Check if current user has already reviewed
      if (user) {
        const userReview = reviewsWithUserInfo.find(review => review.user_id === user.id)
        setUserReview(userReview || null)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [businessId, user])

  // ------------------------------------------------------------
  // Submit Review (create or update)
  // ------------------------------------------------------------
  // Submit review
  const handleSubmitReview = async () => {
    if (!user) return

    try {
      setSubmitting(true)

      const reviewData = {
        business_id: businessId,
        user_id: user.id,
        rating: formData.rating,
        title: formData.title.trim() || undefined,
        comment: formData.comment.trim() || undefined,
        visit_date: formData.visit_date || undefined,
      }

      if (userReview) {
        // Update existing review
        const { error } = await businessStore.updateReview(userReview.id, reviewData)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await businessStore.addReview(reviewData)

        if (error) throw error
      }

      setShowReviewForm(false)
      setFormData({ rating: 5, title: "", comment: "", visit_date: "" })
      await fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // ------------------------------------------------------------
  // Vote on Review
  // ------------------------------------------------------------
  // Vote on review
  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return

    try {
      // Await the async vote action
      const { error } = await businessStore.voteReview(reviewId, user.id, isHelpful)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          const voteChange = review.user_has_voted 
            ? (review.user_vote === isHelpful ? -1 : 0) 
            : 1
          return {
            ...review,
            helpful_votes: review.helpful_votes + voteChange,
            user_has_voted: true,
            user_vote: isHelpful
          }
        }
        return review
      }))
    } catch (error) {
      console.error('Error voting on review:', error)
    }
  }

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      // Await async delete to ensure errors are caught and UI updates after completion
      const { error } = await businessStore.deleteReview(reviewId)

      if (error) throw error

      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        } ${interactive ? "hover:scale-110 transition-transform" : ""}`}
        onClick={() => interactive && onRatingChange?.(i + 1)}
      />
    ))
  }

  const renderRatingBreakdown = () => {
    const totalReviews = reviews.length
    if (totalReviews === 0) return null

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      ratingCounts[review.rating as keyof typeof ratingCounts]++
    })

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-8">{rating}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${(ratingCounts[rating as keyof typeof ratingCounts] / totalReviews) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-12">
              {ratingCounts[rating as keyof typeof ratingCounts]}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <span>Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(currentRating)}
                <span className="text-sm text-gray-600 ml-1">
                  {(currentRating ?? 0).toFixed(1)} ({reviewCount ?? 0} reviews)
                </span>
              </div>
            </div>
          </div>
          {user && !userReview && (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Write Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Review for {businessName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {renderStars(formData.rating, true, (rating) => 
                        setFormData(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your experience"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment">Review</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this business..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visit_date">Visit Date (optional)</Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview} 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {userReview && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">Your Review</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      rating: userReview.rating,
                      title: userReview.title || "",
                      comment: userReview.comment || "",
                      visit_date: userReview.visit_date || "",
                    })
                    setShowReviewForm(true)
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteReview(userReview.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(userReview.rating)}
              {userReview.visit_date && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {userReview.visit_date}
                </Badge>
              )}
            </div>
            {userReview.title && (
              <h5 className="font-medium mb-1">{userReview.title}</h5>
            )}
            {userReview.comment && (
              <p className="text-sm text-gray-700">{userReview.comment}</p>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="space-y-4">
            {renderRatingBreakdown()}
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {review.user_email?.split('@')[0] || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {user && review.user_id === user.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFormData({
                              rating: review.rating,
                              title: review.title || "",
                              comment: review.comment || "",
                              visit_date: review.visit_date || "",
                            })
                            setShowReviewForm(true)
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    {review.visit_date && (
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {review.visit_date}
                      </Badge>
                    )}
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium mb-1">{review.title}</h5>
                  )}
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                  )}
                  
                  {user && review.user_id !== user.id && (
                    <div className="flex items-center gap-4 text-xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 px-2 ${
                          review.user_has_voted && review.user_vote === true
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleVote(review.id, true)}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful ({review.helpful_votes})
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this business!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
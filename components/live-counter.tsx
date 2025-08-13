"use client"

import { useState, useEffect, useRef } from "react"

interface LiveCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function LiveCounter({ value, duration = 500, className = "", prefix = "", suffix = "" }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)
  const previousValueRef = useRef(value)

  useEffect(() => {
    // Only animate if the value actually changed
    if (previousValueRef.current !== value) {
      setIsAnimating(true)

      const startValue = displayValue
      const difference = value - startValue
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.round(startValue + difference * easeOutQuart)

        setDisplayValue(currentValue)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          animationRef.current = null
        }
      }

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      animationRef.current = requestAnimationFrame(animate)
      previousValueRef.current = value
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [value, duration]) // Remove displayValue from dependencies

  // Initialize display value on mount
  useEffect(() => {
    setDisplayValue(value)
    previousValueRef.current = value
  }, []) // Only run on mount

  return (
    <span className={`${className} ${isAnimating ? "text-blue-600 font-bold" : ""} transition-colors duration-200`}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

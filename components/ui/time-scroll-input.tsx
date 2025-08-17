"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

/**
 * TimeScrollInput
 * - Reusable time input that supports mouse wheel and touch/drag to change time.
 * - Auto-detects 12h vs 24h format from the incoming value and preserves it on updates.
 * - Provides live updates as the user scrolls/drags.
 * - Default step: 15 minutes.
 *
 * Expected value examples:
 * - 24h: "09:00", "17:45"
 * - 12h: "9:00 AM", "5:45 pm"
 */
export function TimeScrollInput({
  value,
  onChange,
  step = 15,
  ariaLabel,
  className = "",
}: {
  value: string
  onChange: (next: string) => void
  step?: number
  ariaLabel?: string
  className?: string
}) {
  // Detect 12h format if value contains AM/PM (case-insensitive)
  const is12h = useMemo(() => /\b(am|pm)\b/i.test(value), [value])

  // Parse time into minutes from midnight (0..1439)
  const parseTime = useCallback(
    (v: string): number => {
      const trimmed = v.trim()
      const ampmMatch = trimmed.match(/\b(am|pm)\b/i)
      const hasAmPm = !!ampmMatch
      let hh = 0
      let mm = 0
      const [hPart, mPartRaw] = trimmed.replace(/\s*(am|pm)\s*/i, "").split(":")
      hh = Math.max(0, Math.min(23, parseInt(hPart || "0", 10)))
      mm = Math.max(0, Math.min(59, parseInt((mPartRaw || "0").slice(0, 2), 10)))

      if (hasAmPm) {
        const isPM = /pm/i.test(ampmMatch![0])
        // Convert 12h->24h
        if (isPM && hh < 12) hh += 12
        if (!isPM && hh === 12) hh = 0
      }
      return (hh * 60 + mm) % (24 * 60)
    },
    []
  )

  // Format minutes from midnight back into a string, preserving 12h/24h style
  const formatTime = useCallback(
    (mins: number, use12h: boolean): string => {
      const total = ((mins % 1440) + 1440) % 1440
      const hh24 = Math.floor(total / 60)
      const mm = total % 60
      if (!use12h) {
        const hh = hh24.toString().padStart(2, "0")
        const mmStr = mm.toString().padStart(2, "0")
        return `${hh}:${mmStr}`
      }
      const isPM = hh24 >= 12
      const base = hh24 % 12 === 0 ? 12 : hh24 % 12
      const hhStr = String(base)
      const mmStr = mm.toString().padStart(2, "0")
      return `${hhStr}:${mmStr} ${isPM ? "PM" : "AM"}`
    },
    []
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [internal, setInternal] = useState(() => parseTime(value))

  // Keep internal in sync when parent value changes from outside
  useEffect(() => {
    setInternal(parseTime(value))
  }, [value, parseTime])

  // Commit current internal minutes to parent (live updates)
  const commit = useCallback(
    (nextMins: number) => {
      setInternal(nextMins)
      onChange(formatTime(nextMins, is12h))
    },
    [formatTime, is12h, onChange]
  )

  // Wheel: increment/decrement by step
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? step : -step
      commit(internal + delta)
    },
    [commit, internal, step]
  )

  // Touch/drag support for mobile
  const startY = useRef<number | null>(null)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startY.current == null) return
      const dy = e.touches[0].clientY - startY.current
      // Each ~24px of vertical drag changes one step (tweakable)
      const steps = Math.floor(dy / -24)
      if (steps !== 0) {
        startY.current = e.touches[0].clientY
        commit(internal + steps * step)
      }
    },
    [commit, internal, step]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        commit(internal - step)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        commit(internal + step)
      } else if (e.key === "PageUp") {
        e.preventDefault()
        commit(internal - step * 4)
      } else if (e.key === "PageDown") {
        e.preventDefault()
        commit(internal + step * 4)
      }
    },
    [commit, internal, step]
  )

  // Smooth visual transition: fade/slide on value changes
  const display = formatTime(internal, is12h)

  return (
    <div
      ref={containerRef}
      className={
        "relative inline-flex items-center justify-center select-none " +
        "border rounded px-2 py-2 w-full h-10 bg-white text-sm " +
        "transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 " +
        className
      }
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuetext={display}
      tabIndex={0}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      <span
        className="pointer-events-none transition-all duration-150 ease-out will-change-transform"
      >
        {display}
      </span>
    </div>
  )
}

export default TimeScrollInput

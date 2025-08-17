"use client"

import React, { useCallback, useState } from "react"

/**
 * TagInput
 * - Reusable tag entry that accepts ANY text (spaces and symbols allowed).
 * - Adds a tag on Enter or when clicking the add button.
 * - No forced delimiter parsing (commas/dashes not required).
 * - Emits clean string[] via onChange.
 */
export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter to add",
  className = "",
  inputClassName = "",
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}) {
  const [draft, setDraft] = useState("")

  const addTag = useCallback(() => {
    const t = draft.trim()
    if (!t) return
    if (!value.includes(t)) onChange([...value, t])
    setDraft("")
  }, [draft, onChange, value])

  const removeTag = useCallback((tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }, [onChange, value])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }, [addTag])

  return (
    <div className={"w-full " + className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 border"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="ml-1 text-gray-500 hover:text-gray-700"
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={"border rounded px-3 py-2 flex-1 text-sm " + inputClassName}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Add specialty"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 text-sm rounded bg-gray-900 text-white hover:bg-black/90"
        >
          Add
        </button>
      </div>
    </div>
  )
}

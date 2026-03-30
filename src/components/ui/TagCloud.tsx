'use client'

import { useState } from 'react'
import { TagPill } from './TagPill'

interface TagCloudProps {
  tags: string[]
  maxVisible?: number
}

export function TagCloud({ tags, maxVisible = 5 }: TagCloudProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? tags : tags.slice(0, maxVisible)
  const hidden = tags.length - maxVisible

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((tag) => (
        <TagPill key={tag} label={tag} />
      ))}
      {!expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200"
        >
          +{hidden} more
        </button>
      )}
    </div>
  )
}

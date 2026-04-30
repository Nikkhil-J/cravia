/**
 * ReviewCard component tests.
 *
 * @testing-library/react is NOT installed in this project.
 * Tests are marked as it.todo — install the library to enable rendering.
 *
 * Required packages:
 *   pnpm add -D @testing-library/react @testing-library/user-event jsdom
 */

import { describe, it } from 'vitest'

describe('ReviewCard', () => {
  it.todo('renders dish name and restaurant name when dishContext is provided')

  it.todo('renders taste, portion, and value rating pills')

  it.todo('shows "Bill attached" badge when review.isVerified is true')

  it.todo('does NOT show "Bill attached" badge when review.isVerified is false')

  it.todo('shows helpful vote count')

  it.todo('renders reviewer level badge')

  it.todo('renders tags when present')

  it.todo('renders correctly when tags array is empty')

  it.todo('shows photo thumbnail when review.photoUrl is set')

  it.todo('does not show photo thumbnail when review.photoUrl is null')

  it.todo('shows "See more" button when review text exceeds preview length')

  it.todo('does not show "See more" when review text is within preview length')

  it.todo('shows Edit and Delete buttons when currentUserId matches review.userId and review is editable')

  it.todo('shows "Edit closed" when currentUserId matches but review is older than 24 hours')

  it.todo('does not show Edit/Delete when currentUserId does not match review.userId')
})

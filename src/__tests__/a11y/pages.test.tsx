/**
 * Accessibility (axe) tests.
 *
 * jest-axe / @testing-library/react are NOT installed in this project.
 * These tests are registered as `it.todo` so they appear in the test run
 * as explicit gaps — install the libraries listed below to enable them.
 *
 * Required packages to enable these tests:
 *   pnpm add -D @testing-library/react @testing-library/user-event jest-axe jsdom
 *   (plus vitest jsdom environment config in vitest.config.ts)
 */

import { describe, it } from 'vitest'

describe('Accessibility — axe smoke tests', () => {
  it.todo(
    'landing page has no critical axe violations — install jest-axe + @testing-library/react to enable',
  )

  it.todo(
    'explore page has no critical axe violations',
  )

  it.todo(
    'dish detail page has no critical axe violations',
  )

  it.todo(
    'write-review form has no critical axe violations',
  )

  it.todo(
    'restaurant page has no critical axe violations',
  )
})

describe('Accessibility — manual checklist (structural)', () => {
  /**
   * These describe known a11y issues found during the manual audit.
   * Each failing item below corresponds to a MEDIUM severity issue.
   */

  it.todo(
    'write-review textarea has an explicit <label> associated via htmlFor',
  )

  it.todo(
    'SearchBar input has a visible or screen-reader <label>',
  )

  it.todo(
    'skip-to-main-content link exists in root layout',
  )

  it.todo(
    'SearchOverlay has role="listbox" on the results list',
  )

  it.todo(
    'SearchOverlay result items have role="option"',
  )

  it.todo(
    'SearchOverlay input has aria-expanded reflecting open state',
  )

  it.todo(
    'icon-only MobileBottomNav Review FAB has an aria-label',
  )
})

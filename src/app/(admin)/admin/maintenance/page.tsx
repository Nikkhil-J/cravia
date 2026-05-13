'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { API_ENDPOINTS } from '@/lib/constants/api'

// ── Types ────────────────────────────────────────────────────────────────────

interface MaintenanceTool {
  id: string
  title: string
  description: string
  bulkWarning?: string
  confirmMessage: string
  endpoint: string
  getSuccessMessage: (data: Record<string, unknown>) => string
}

// ── Tool definitions ─────────────────────────────────────────────────────────

const MAINTENANCE_TOOLS: MaintenanceTool[] = [
  {
    id: 'backfill-dish-city',
    title: 'Backfill dish city',
    description:
      'Normalises the city field on all dish documents to lowercase "gurugram". Idempotent — safe to re-run at any time.',
    bulkWarning: 'Bulk write — affects every dish in Firestore',
    confirmMessage:
      'This will scan every dish document and set city = "gurugram" on any that are missing, null, or inconsistently cased.',
    endpoint: API_ENDPOINTS.ADMIN_TOOL_BACKFILL_DISH_CITY,
    getSuccessMessage: (data) =>
      typeof data.message === 'string'
        ? data.message
        : `Updated ${data.updated ?? 0} dishes.`,
  },
  {
    id: 'backfill-dish-denorm',
    title: 'Backfill dish denorm',
    description:
      "Copies cuisines and area from each dish's parent restaurant document onto the dish. Required for cuisine and area filters.",
    bulkWarning: 'Bulk write — affects every dish in Firestore',
    confirmMessage:
      'This will scan all dishes and overwrite their cuisines and area fields from the parent restaurant document.',
    endpoint: API_ENDPOINTS.ADMIN_TOOL_BACKFILL_DISH_DENORM,
    getSuccessMessage: (data) =>
      typeof data.message === 'string'
        ? data.message
        : `Updated ${data.updated ?? 0} dishes.`,
  },
  {
    id: 'backfill-tag-counts',
    title: 'Recompute tag counts',
    description:
      'Reads all approved reviews and writes tagCounts + topTags onto every dish that has been reviewed. Run after bulk moderation.',
    bulkWarning: 'Bulk write — affects every reviewed dish in Firestore',
    confirmMessage:
      'This will scan all approved reviews and overwrite the tagCounts and topTags fields on dish documents.',
    endpoint: API_ENDPOINTS.ADMIN_TOOL_BACKFILL_TAG_COUNTS,
    getSuccessMessage: (data) =>
      typeof data.message === 'string'
        ? data.message
        : `Updated ${data.updated ?? 0} dishes.`,
  },
  {
    id: 'sync-typesense',
    title: 'Reindex search',
    description:
      'Upserts all dishes and restaurants from Firestore into the Typesense search index. Run after any bulk data change.',
    bulkWarning: 'Bulk write — reindexes all restaurants and dishes in Typesense',
    confirmMessage:
      'This will upsert every active dish and restaurant from Firestore into Typesense. It does not delete existing documents.',
    endpoint: API_ENDPOINTS.ADMIN_SYNC_TYPESENSE,
    getSuccessMessage: (data) => {
      const dishes = data.dishes as { synced: number; total: number } | undefined
      const restaurants = data.restaurants as { synced: number; total: number } | undefined
      if (dishes && restaurants) {
        return `Reindexed ${dishes.synced}/${dishes.total} dishes and ${restaurants.synced}/${restaurants.total} restaurants.`
      }
      return 'Typesense reindex complete.'
    },
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const { authUser } = useAuth()

  // Set admin form
  const [adminUid, setAdminUid] = useState('')
  const [adminUidError, setAdminUidError] = useState('')
  const [settingAdmin, setSettingAdmin] = useState(false)

  // Maintenance tool dialog
  const [pendingTool, setPendingTool] = useState<MaintenanceTool | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)

  async function getToken(): Promise<string> {
    if (!authUser) throw new Error('Not authenticated')
    return authUser.getIdToken()
  }

  // ── Set admin ──────────────────────────────────────────────────────────────

  async function handleSetAdmin() {
    const uid = adminUid.trim()
    if (!uid) {
      setAdminUidError('UID is required')
      return
    }
    setAdminUidError('')
    setSettingAdmin(true)
    try {
      const token = await getToken()
      const res = await fetch(API_ENDPOINTS.ADMIN_TOOL_SET_ADMIN, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      })
      const data = (await res.json()) as { message?: string; success?: boolean }
      if (!res.ok) throw new Error(data.message ?? 'Failed to grant admin role')
      toast.success(data.message ?? 'Admin role granted')
      setAdminUid('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to grant admin role')
    } finally {
      setSettingAdmin(false)
    }
  }

  // ── Maintenance tools ──────────────────────────────────────────────────────

  function openConfirm(tool: MaintenanceTool) {
    if (runningId !== null) return
    setPendingTool(tool)
  }

  async function handleRunTool() {
    if (!pendingTool) return
    const tool = pendingTool
    setPendingTool(null)
    setRunningId(tool.id)
    try {
      const token = await getToken()
      const res = await fetch(tool.endpoint, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
      const data = (await res.json()) as Record<string, unknown>
      if (!res.ok) throw new Error(typeof data.message === 'string' ? data.message : 'Operation failed')
      toast.success(tool.getSuccessMessage(data))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${tool.title} failed`)
    } finally {
      setRunningId(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Confirmation dialog */}
      <Dialog.Root
        open={pendingTool !== null}
        onOpenChange={(open) => { if (!open) setPendingTool(null) }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              'fixed inset-0 z-50 bg-black/50 transition-opacity duration-150',
              'data-starting-style:opacity-0 data-ending-style:opacity-0',
              'supports-backdrop-filter:backdrop-blur-sm',
            )}
          />
          <Dialog.Popup
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl border border-border bg-card p-6 shadow-xl',
              'transition-all duration-150',
              'data-starting-style:opacity-0 data-starting-style:scale-95',
              'data-ending-style:opacity-0 data-ending-style:scale-95',
            )}
          >
            <Dialog.Title className="font-display text-base font-bold text-heading">
              Run {pendingTool?.title}?
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-text-secondary">
              {pendingTool?.confirmMessage}
            </Dialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close render={<Button variant="outline" size="sm" />}>
                Cancel
              </Dialog.Close>
              <Button size="sm" onClick={handleRunTool}>
                Confirm & run
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Page content */}
      <div>
        <h1 className="font-display text-xl font-bold text-heading">Maintenance</h1>
        <p className="mt-1 text-sm text-text-muted">Admin tools and data backfills. Use with care.</p>

        {/* ── Roles section ─────────────────────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Roles
          </h2>

          <div className="mt-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="font-medium text-heading">Grant Admin Role</p>
            <p className="mt-1 text-sm text-text-muted">
              Sets the Firebase Auth custom claim and Firestore{' '}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">isAdmin: true</code>.
              The user must sign out and back in after this runs.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label
                  htmlFor="admin-uid"
                  className="mb-1.5 block text-xs font-medium text-text-secondary"
                >
                  Firebase UID
                </Label>
                <Input
                  id="admin-uid"
                  placeholder="e.g. abc123xyz456"
                  value={adminUid}
                  onChange={(e) => {
                    setAdminUid(e.target.value)
                    if (adminUidError) setAdminUidError('')
                  }}
                  disabled={settingAdmin}
                  className={adminUidError ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                />
                {adminUidError && (
                  <p className="mt-1 text-xs text-destructive">{adminUidError}</p>
                )}
              </div>
              <Button
                onClick={handleSetAdmin}
                disabled={settingAdmin}
                className="sm:shrink-0"
              >
                {settingAdmin ? 'Granting…' : 'Grant admin'}
              </Button>
            </div>
          </div>
        </section>

        {/* ── Data backfills section ────────────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Data Backfills
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Each operation shows a confirmation prompt before running. Only one operation can run at a time.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {MAINTENANCE_TOOLS.map((tool) => {
              const isRunning = runningId === tool.id
              const isDisabled = runningId !== null

              return (
                <div
                  key={tool.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <p className="font-medium text-heading">{tool.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{tool.description}</p>
                  {tool.bulkWarning && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <span aria-hidden>⚠️</span>
                      {tool.bulkWarning}
                    </p>
                  )}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => openConfirm(tool)}
                    >
                      {isRunning ? 'Running…' : 'Run'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

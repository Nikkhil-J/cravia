'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { getNotifications } from '@/lib/services/notifications'
import { formatRelativeTime } from '@/lib/utils/index'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Notification } from '@/lib/types'
import { ROUTES } from '@/lib/constants/routes'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { CONFIG } from '@/lib/constants'

export function NotificationPopover() {
  const { user } = useAuth()
  const authUser = useAuthStore((s) => s.authUser)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!authUser) return
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.count ?? 0)
      }
    } catch { /* silent */ }
  }, [authUser])

  useEffect(() => {
    if (!authUser) return
    const initialTimer = setTimeout(fetchUnreadCount, 0)
    const interval = setInterval(fetchUnreadCount, CONFIG.NOTIFICATION_POLL_INTERVAL_MS)

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') fetchUnreadCount()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [authUser, fetchUnreadCount])

  useEffect(() => {
    if (!open || !user || hasFetched) return
    setLoading(true)
    getNotifications(user.id, CONFIG.NOTIFICATION_PREVIEW_LIMIT)
      .then(setNotifications)
      .finally(() => {
        setLoading(false)
        setHasFetched(true)
      })
  }, [open, user, hasFetched])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setHasFetched(false)
    }
  }

  async function handleMarkAllRead() {
    if (!authUser) return
    try {
      const token = await authUser.getIdToken()
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch { /* silent */ }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="relative flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full border border-border bg-bg-cream text-text-secondary transition-colors hover:border-primary hover:text-primary"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 h-[18px] min-w-[18px] rounded-full px-1 text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-[380px] max-w-[calc(100vw-32px)] flex flex-col" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-4">
          <h2 className="text-base font-bold text-heading">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="link"
              onClick={handleMarkAllRead}
              className="h-auto p-0 text-xs font-medium text-primary"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <SkeletonList />
        ) : notifications.length === 0 ? (
          <EmptyBell />
        ) : (
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onNavigate={() => setOpen(false)} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border">
          <Link
            href={ROUTES.NOTIFICATIONS}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-semibold text-primary transition-colors hover:bg-surface-2"
          >
            View all notifications
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({
  notification: n,
  onNavigate,
}: {
  notification: Notification
  onNavigate: () => void
}) {
  const classes = cn(
    'block px-4 py-3 border-b border-surface-2 last:border-b-0 transition-colors cursor-pointer',
    n.isRead ? 'bg-card hover:bg-surface-2' : 'bg-primary-light hover:bg-[color-mix(in_srgb,var(--color-primary-light)_85%,var(--color-primary))]'
  )

  const content = (
    <>
      <div className="flex items-center gap-1">
        {!n.isRead && (
          <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
        )}
        <p className="text-[13px] font-semibold text-text-primary">{n.title}</p>
      </div>
      <p className="mt-0.5 text-[13px] text-text-secondary">{n.message}</p>
      <p className="mt-1 text-[11px] text-text-muted">{formatRelativeTime(n.createdAt)}</p>
    </>
  )

  if (n.linkUrl) {
    return (
      <Link href={n.linkUrl} onClick={onNavigate} className={classes}>
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}

function SkeletonList() {
  return (
    <div className="py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="px-4 py-3 border-b border-surface-2 last:border-b-0">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-3/5 animate-pulse rounded-md bg-surface-2" />
            <div className="h-3 w-4/5 animate-pulse rounded-md bg-surface-2" style={{ animationDelay: `${i * 100}ms` }} />
            <div className="h-2.5 w-1/4 animate-pulse rounded-md bg-surface-2" style={{ animationDelay: `${i * 200}ms` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyBell() {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 80 80"
        fill="none"
        className="mb-4 h-[72px] w-[72px]"
      >
        <path
          d="M40 12c-11.046 0-20 8.954-20 20v14c0 2-4 6-4 6h48s-4-4-4-6V32c0-11.046-8.954-20-20-20z"
          className="fill-surface-2 stroke-border"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 56a6 6 0 0 0 12 0"
          className="stroke-border"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="12" r="3" className="fill-surface-2 stroke-border" strokeWidth="2" />
        <text x="54" y="22" className="fill-border" fontFamily="inherit" fontSize="11" fontWeight="700">z</text>
        <text x="60" y="16" className="fill-border" fontFamily="inherit" fontSize="9" fontWeight="600" opacity="0.7">z</text>
        <text x="64" y="11" className="fill-border" fontFamily="inherit" fontSize="7" fontWeight="600" opacity="0.5">z</text>
      </svg>
      <h3 className="text-[15px] font-bold text-heading">No notifications yet</h3>
      <p className="mt-1 max-w-[220px] text-[13px] text-text-muted">
        When you get helpful votes or earn badges, they&apos;ll show up here.
      </p>
    </div>
  )
}

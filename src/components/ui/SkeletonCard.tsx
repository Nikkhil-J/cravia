import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  variant?: 'dish' | 'restaurant'
  className?: string
}

export function SkeletonCard({ variant = 'dish', className }: SkeletonCardProps) {
  const imageHeight = variant === 'restaurant' ? 'h-32' : 'h-36'

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border border-border bg-card', className)}>
      <div className={cn('w-full animate-pulse bg-surface-3', imageHeight)} />
      <div className="flex flex-1 flex-col p-3.5">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-surface-3" />
        <div className="mt-0.5 h-3 w-1/2 animate-pulse rounded-md bg-surface-3" />
        {variant === 'restaurant' && (
          <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded-md bg-surface-3" />
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-3 w-24 animate-pulse rounded-md bg-surface-3" />
          {variant === 'dish' && (
            <div className="h-3.5 w-10 animate-pulse rounded-md bg-surface-3" />
          )}
        </div>
      </div>
    </div>
  )
}

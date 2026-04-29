import { type ReactNode } from 'react'
import { ProtoSwitcher } from '@/components/features/proto/ProtoSwitcher'

export const metadata = {
  title: 'Cravia · Landing Prototypes',
  robots: { index: false, follow: false },
}

export default function ProtoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none sticky top-0 z-30 flex justify-center pt-4">
        <div className="pointer-events-auto">
          <ProtoSwitcher />
        </div>
      </div>
      {children}
    </div>
  )
}

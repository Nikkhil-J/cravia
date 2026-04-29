import { PageTransition } from '@/components/ui/PageTransition'

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

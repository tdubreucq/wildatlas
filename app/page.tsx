import { redirect } from 'next/navigation'

// The middleware handles locale detection and redirects,
// but this catches any direct hits to "/" during static generation.
export default function RootPage() {
  redirect('/fr')
}

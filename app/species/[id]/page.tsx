import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LegacySpeciesPage({ params }: Props) {
  const { id } = await params
  redirect(`/fr/species/${id}`)
}

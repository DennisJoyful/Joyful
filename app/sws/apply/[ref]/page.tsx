import ApplyForm from '@/components/ApplyForm'

export default async function ApplyPage(
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params
  return <ApplyForm refCode={ref} />
}

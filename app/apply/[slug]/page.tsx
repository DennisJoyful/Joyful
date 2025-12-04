import ApplyForm from '@/components/ApplyForm';

export default async function ApplyPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_60%)]">
      <ApplyForm slug={slug} />
    </div>
  );
}

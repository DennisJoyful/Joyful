import ApplyForm from '@/components/ApplyForm';

export default async function ApplyPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <div className="min-h-[85vh] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-white to-white"></div>
      <div className="absolute -top-24 -right-24 w-[36rem] h-[36rem] rounded-full bg-amber-200/40 blur-3xl -z-10" />
      <div className="absolute -bottom-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-yellow-100/50 blur-3xl -z-10" />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <ApplyForm slug={ref} />
      </div>
    </div>
  );
}

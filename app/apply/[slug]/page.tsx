
import ApplyForm from "@/components/ApplyForm";

export default function Page({ params }: { params: { slug: string } }) {
  return <ApplyForm slug={params.slug} mode="manager" />;
}

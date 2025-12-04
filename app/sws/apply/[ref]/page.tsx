
import ApplyForm from "@/components/ApplyForm";

export default function Page({ params }: { params: { ref: string } }) {
  return <ApplyForm slug={params.ref} mode="sws" />;
}

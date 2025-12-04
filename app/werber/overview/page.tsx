export default async function WerberOverviewPage(
  props: { searchParams: Promise<{ id?: string | string[] }> }
) {
  const { id } = await props.searchParams;
  return (
    <div className="card">
      <h1 className="h1">Werber Übersicht</h1>
      <p className="mt-2">Beispiel für Next 15 searchParams as Promise.</p>
      <p className="mt-2">id: {Array.isArray(id) ? id.join(",") : id ?? "-"}</p>
    </div>
  );
}

export default function KPI({label, value}:{label:string; value:number|string}){
  return (
    <div className="rounded-xl ring-1 ring-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

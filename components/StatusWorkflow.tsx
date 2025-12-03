'use client';
import { useTransition } from 'react';

const STATI = ['keine reaktion','eingeladen','abgesagt','gejoint','aktiv','inaktiv','followup'] as const;
type Status = typeof STATI[number];

export default function StatusWorkflow({id, status}:{id:string; status:Status}){
  const [pending, start] = useTransition();
  const setStatus = (s:Status)=>{
    start(async ()=>{
      await fetch('/api/v1/leads/status', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({ id, status: s })
      });
    });
  };
  return (
    <div className="flex flex-wrap gap-1">
      {STATI.map(s=>(
        <button key={s} disabled={pending} onClick={()=>setStatus(s)}
          className={"px-2 py-1 rounded border text-xs " + (s===status ? "bg-black text-white" : "bg-white")}>
          {s}
        </button>
      ))}
    </div>
  );
}

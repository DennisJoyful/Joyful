import React from 'react';
import { getProfile } from './getProfile';

export async function requireAdmin(children: React.ReactNode) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return <div className="card">403 – Kein Zugriff</div>;
  return <>{children}</>;
}
export async function requireManager(children: React.ReactNode) {
  const { user, profile } = await getProfile();
  if (!user || (profile?.role !== 'manager' && profile?.role !== 'admin')) return <div className="card">403 – Kein Zugriff</div>;
  return <>{children}</>;
}

'use client';

import { useState } from 'react';
import type { Restaurant, Visit } from '@/lib/types';

export default function VisitsSection({
  restaurants,
  initialVisits,
}: {
  restaurants: Restaurant[];
  initialVisits: Visit[];
}) {
  // Everything the form collects is kept as plain strings - simplest possible
  // state, matches what HTML inputs give us. We convert to numbers only when
  // we send the request.
  const [visits, setVisits] = useState(initialVisits);
  const [restaurantId, setRestaurantId] = useState('');
  const [date, setDate] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: Number(restaurantId),
        date: date,
        amountSpent: amountSpent === '' ? undefined : Number(amountSpent),
        notes: notes === '' ? undefined : notes,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || 'Something went wrong');
      return;
    }

    const newVisit = await res.json();
    setVisits([newVisit, ...visits]);
    setDate('');
    setAmountSpent('');
    setNotes('');
  }

  async function handleDelete(id: number) {
    const res = await fetch('/api/visits/' + id, { method: 'DELETE' });
    if (res.ok) {
      setVisits(visits.filter((v) => v.id !== id));
    }
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-medium">Log a Visit</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <select
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          required
          className="w-full rounded border border-gray-300 p-2"
        >
          <option value="">Select a restaurant</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded border border-gray-300 p-2"
        />

        <input
          type="number"
          placeholder="Amount spent"
          value={amountSpent}
          onChange={(e) => setAmountSpent(e.target.value)}
          className="w-full rounded border border-gray-300 p-2"
        />

        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded border border-gray-300 p-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Add Visit
        </button>
      </form>

      <ul className="space-y-3">
        {visits.map((visit) => (
          <li
            key={visit.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div>
              <div className="font-medium">Restaurant #{visit.restaurantId}</div>
              <div className="text-sm text-gray-600">
                {visit.date} · ${visit.amountSpent ?? '—'} {visit.notes ? '· ' + visit.notes : ''}
              </div>
            </div>
            <button onClick={() => handleDelete(visit.id)} className="text-sm text-red-600">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
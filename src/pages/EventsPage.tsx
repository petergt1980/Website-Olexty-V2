import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../types';
import { Calendar, Clock, Gamepad2, Users, ExternalLink } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: EventItem[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as EventItem),
        id: docSnap.id,
      }));
      setEvents(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F5F8] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#8B8CF8]" /> Jadwal Scrim & Turnamen
        </h1>
        <p className="text-sm text-[#9CA3B4] mt-1">
          Pantau jadwal mabar, tanding scrim, dan turnamen komunitas OLEXTY.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-[#9CA3B4]">Memuat jadwal...</div>
      ) : events.length === 0 ? (
        <div className="bg-[#181A22] border border-[#292C36] rounded-2xl p-12 text-center text-xs text-[#9CA3B4]">
          Belum ada jadwal scrim atau turnamen mendatang.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#181A22] border border-[#292C36] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8B8CF8]/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#8B8CF8]/10 text-[#8B8CF8] border border-[#8B8CF8]/20 uppercase">
                    {evt.type}
                  </span>
                  <span className="text-xs text-[#9CA3B4] flex items-center gap-1">
                    <Gamepad2 className="w-3.5 h-3.5" /> {evt.game}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#F4F5F8]">{evt.title}</h3>
                <div className="flex items-center gap-4 text-xs text-[#9CA3B4]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8B8CF8]" /> {evt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8B8CF8]" /> {evt.time} WIB
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#8B8CF8]" /> Slot: {evt.slots}
                  </span>
                </div>
              </div>

              {evt.link && (
                <a
                  href={evt.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#8B8CF8] hover:bg-[#7879E8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Daftar / Join <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
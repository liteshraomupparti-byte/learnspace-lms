import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import { eventService } from '@/services/eventService';
import type { PortalEvent } from '@/types';

export const EventsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const fetched = await eventService.getPublishedEvents();
        setEvents(fetched);
      } catch (e) {
        console.error('Error fetching events:', e);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const now = new Date().getTime();
  const filteredEvents = events.filter((ev) => {
    const eventTime = new Date(ev.date).getTime();
    if (activeTab === 'upcoming') {
      return isNaN(eventTime) || eventTime >= now;
    } else {
      return !isNaN(eventTime) && eventTime < now;
    }
  });

  const displayEvent = filteredEvents[0];

  return (
    <section className="bg-white border border-[#d2dce9] rounded-[21px] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-[#d2dce9]">
        <h2 className="text-xl font-semibold text-[#101827]">
          Learning Updates
        </h2>
        <div className="flex gap-1.5 bg-[#edf1f7] p-1 rounded-full">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-[#dceaff] text-[#2463eb]'
                : 'text-[#61748f] hover:text-[#101827]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'past'
                ? 'bg-[#dceaff] text-[#2463eb]'
                : 'text-[#61748f] hover:text-[#101827]'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="h-48 rounded-2xl bg-[#f0f4f8] animate-pulse" />
        ) : displayEvent ? (
          <div>
            {/* Visual banner */}
            <div className="h-44 rounded-2xl bg-[#080a10] relative overflow-hidden flex items-center justify-center p-6 text-white mb-4">
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background:
                    'radial-gradient(circle at 78% 25%, #243d69 0, transparent 40%), linear-gradient(135deg, #0a0b0e, #171c28)',
                }}
              />
              <div className="relative text-left w-full z-10">
                <div className="text-[10px] tracking-widest text-[#b5c4d8] font-bold uppercase">
                  LEARNING SPOTLIGHT
                </div>
                <div className="text-2xl font-extrabold leading-tight mt-2">
                  BUILD<br />YOUR NEXT<br />
                  <span className="text-[#4e8cff]">BIG IDEA</span>
                </div>
                <div className="text-[10px] mt-2 text-[#b7c6d9] font-medium tracking-wider">
                  LEARN • PRACTICE • CREATE
                </div>
              </div>
            </div>

            <span className="inline-block bg-[#08b8d0] text-white rounded-full px-3 py-1 text-xs font-semibold mb-2">
              {displayEvent.tag || (activeTab === 'upcoming' ? 'Reminder' : 'Completed')}
            </span>

            <h3 className="text-base font-semibold text-[#101827] mb-1">
              {displayEvent.title}
            </h3>

            <div className="text-xs text-[#61748e] flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(displayEvent.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <p className="text-xs text-[#65748b] leading-relaxed">
              {displayEvent.description}
            </p>
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-[#65748b]">
            No {activeTab} learning events recorded at this time.
          </div>
        )}
      </div>
    </section>
  );
};

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ScheduleSection() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch('/api/schedules')
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(() => {});
  }, []);

  if (schedules.length === 0) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = d - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      const dateFormatted = d.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      if (days < 0) return { text: dateFormatted, badge: 'Đã phát', badgeClass: 'released' };
      if (days === 0) return { text: dateFormatted, badge: 'Hôm nay', badgeClass: 'today' };
      if (days === 1) return { text: dateFormatted, badge: 'Ngày mai', badgeClass: 'tomorrow' };
      return { text: dateFormatted, badge: `${days} ngày nữa`, badgeClass: 'upcoming' };
    } catch {
      return { text: '', badge: '', badgeClass: '' };
    }
  };

  return (
    <div className="schedule-section">
      <h2 className="section-title">Lịch Ra Tập Mới</h2>
      <div className="schedule-list">
        {schedules.map((s) => {
          const dateInfo = formatDate(s.releaseDate);
          return (
            <div key={s.id} className="schedule-item">
              <div className="schedule-date">
                <span className={`schedule-badge ${dateInfo.badgeClass}`}>{dateInfo.badge}</span>
                <span className="schedule-time">{dateInfo.text}</span>
              </div>
              <div className="schedule-info">
                <span className="schedule-movie">
                  {s.movieSlug ? (
                    <Link href={`/movie/${s.movieSlug}`}>{s.movieName}</Link>
                  ) : (
                    s.movieName
                  )}
                </span>
                <span className="schedule-episode">{s.episodeName}</span>
                {s.note && <span className="schedule-note">{s.note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

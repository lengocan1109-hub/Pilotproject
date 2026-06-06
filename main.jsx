import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'pebble-jar-starter-v1';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, '0');
  const date = String(day).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

function getMonthDays(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMonthStartOffset(year, monthIndex) {
  // Monday-first calendar. JS Sunday = 0, Monday = 1.
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

const defaultHabits = [
  { id: 'water', name: 'Drink water', emoji: '💧' },
  { id: 'move', name: 'Move body', emoji: '🚶' },
  { id: 'reflect', name: 'Reflect', emoji: '✍️' },
];

function App() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [habits, setHabits] = useState(defaultHabits);
  const [checks, setChecks] = useState({});
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.habits) setHabits(parsed.habits);
      if (parsed.checks) setChecks(parsed.checks);
    } catch (error) {
      console.error('Could not load saved data', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits, checks }));
  }, [habits, checks]);

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en', { month: 'long', year: 'numeric' });
  const todayKey = getTodayKey();

  const calendarCells = useMemo(() => {
    const totalDays = getMonthDays(year, monthIndex);
    const offset = getMonthStartOffset(year, monthIndex);
    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [year, monthIndex]);

  function toggleHabit(dateKey, habitId) {
    setChecks((current) => {
      const dayChecks = current[dateKey] || {};
      return {
        ...current,
        [dateKey]: {
          ...dayChecks,
          [habitId]: !dayChecks[habitId],
        },
      };
    });
  }

  function addHabit(event) {
    event.preventDefault();
    const name = newHabit.trim();
    if (!name) return;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    setHabits((current) => [...current, { id, name, emoji: '🟡' }]);
    setNewHabit('');
  }

  function removeHabit(habitId) {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));
    setChecks((current) => {
      const next = {};
      Object.entries(current).forEach(([dateKey, dayChecks]) => {
        const { [habitId]: _removed, ...remaining } = dayChecks;
        next[dateKey] = remaining;
      });
      return next;
    });
  }

  function completionForDate(dateKey) {
    if (!habits.length) return 0;
    const dayChecks = checks[dateKey] || {};
    const completed = habits.filter((habit) => dayChecks[habit.id]).length;
    return Math.round((completed / habits.length) * 100);
  }

  const monthCompletion = useMemo(() => {
    const totalDays = getMonthDays(year, monthIndex);
    let completedCount = 0;
    let totalPossible = totalDays * habits.length;
    if (!totalPossible) return 0;

    for (let day = 1; day <= totalDays; day += 1) {
      const key = getDateKey(year, monthIndex, day);
      const dayChecks = checks[key] || {};
      completedCount += habits.filter((habit) => dayChecks[habit.id]).length;
    }
    return Math.round((completedCount / totalPossible) * 100);
  }, [year, monthIndex, habits, checks]);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Pebble Jar</p>
        <h1>Small habits, one pebble at a time.</h1>
        <p className="subtitle">
          A simple habit tracker built for daily consistency. No login, no noise — your data stays in this browser.
        </p>
      </section>

      <section className="panel stats-panel">
        <div>
          <p className="label">This month</p>
          <h2>{monthCompletion}% complete</h2>
        </div>
        <div className="jar" aria-label="Progress jar">
          {Array.from({ length: Math.max(1, Math.round(monthCompletion / 10)) }).map((_, index) => (
            <span key={index} className="pebble" />
          ))}
        </div>
      </section>

      <section className="panel controls">
        <button onClick={() => setViewDate(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <h2>{monthName}</h2>
        <button onClick={() => setViewDate(new Date(year, monthIndex + 1, 1))} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </section>

      <section className="calendar panel">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}

        {calendarCells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="day empty" />;
          const dateKey = getDateKey(year, monthIndex, day);
          const percent = completionForDate(dateKey);
          return (
            <div key={dateKey} className={`day ${dateKey === todayKey ? 'today' : ''}`}>
              <div className="day-header">
                <span>{day}</span>
                <small>{percent}%</small>
              </div>
              <div className="habit-dots">
                {habits.map((habit) => (
                  <button
                    key={habit.id}
                    className={`dot ${checks[dateKey]?.[habit.id] ? 'active' : ''}`}
                    title={habit.name}
                    onClick={() => toggleHabit(dateKey, habit.id)}
                  >
                    {habit.emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="panel habits-panel">
        <div className="section-heading">
          <div>
            <p className="label">Your habits</p>
            <h2>Track up to a few simple actions</h2>
          </div>
        </div>

        <form className="add-habit" onSubmit={addHabit}>
          <input
            value={newHabit}
            onChange={(event) => setNewHabit(event.target.value)}
            placeholder="Add a habit, e.g. Morning water"
          />
          <button type="submit"><Plus size={18} /> Add</button>
        </form>

        <div className="habit-list">
          {habits.map((habit) => (
            <div key={habit.id} className="habit-item">
              <span>{habit.emoji}</span>
              <strong>{habit.name}</strong>
              <button className="ghost" onClick={() => removeHabit(habit.id)} aria-label={`Remove ${habit.name}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

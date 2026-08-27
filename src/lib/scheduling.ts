export const SESSION_MINUTES = 120;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** "14:00" / "14:00:00" -> minutes since midnight */
export const toMinutes = (time: string): number => {
  const [h, m] = time.split(":");
  return parseInt(h, 10) * 60 + parseInt(m ?? "0", 10);
};

export const toTimeString = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatTimeLabel = (time: string): string => {
  const minutes = toMinutes(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const formatSessionRange = (time: string, duration = SESSION_MINUTES): string =>
  `${formatTimeLabel(time)} – ${formatTimeLabel(toTimeString(toMinutes(time) + duration))}`;

export interface Busy {
  start: number;
  end: number;
}

export const overlaps = (aStart: number, aEnd: number, b: Busy): boolean =>
  aStart < b.end && b.start < aEnd;

/**
 * Build 2-hour session slots that fit inside the given availability windows
 * and do not overlap any busy interval.
 */
export const buildSessionSlots = (
  windows: { start_time: string; end_time: string }[],
  busy: Busy[],
  stepMinutes = 30,
  duration = SESSION_MINUTES,
): string[] => {
  const slots: string[] = [];

  for (const window of windows) {
    const windowStart = toMinutes(window.start_time);
    const windowEnd = toMinutes(window.end_time);

    for (let start = windowStart; start + duration <= windowEnd; start += stepMinutes) {
      const end = start + duration;
      if (busy.some((b) => overlaps(start, end, b))) continue;
      const label = toTimeString(start);
      if (!slots.includes(label)) slots.push(label);
    }
  }

  return slots.sort();
};

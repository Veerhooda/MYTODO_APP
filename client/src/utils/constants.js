export const PILLAR_COLORS = {
  'Competitive Programming': '#FB9B8F',
  'Systems': '#FDC3A1',
  'Development': '#FFF7CD',
  'Academics': '#F57799',
};

export const PILLAR_BADGES = {
  'Competitive Programming': 'badge-cp',
  'Systems': 'badge-systems',
  'Development': 'badge-dev',
  'Academics': 'badge-academics',
};

export const PILLAR_SHORT = {
  'Competitive Programming': 'CP',
  'Systems': 'SYS',
  'Development': 'DEV',
  'Academics': 'ACAD',
};

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [];
for (let h = 6; h <= 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export function formatDate(d) {
  return new Date(d).toISOString().split('T')[0];
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

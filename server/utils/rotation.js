/**
 * Weekly Rotation Engine
 * 4-week cycle: A (CP) → B (Systems) → C (Development) → D (Academics)
 * Each week has Primary, Secondary, Maintenance assignments.
 */

const ROTATION = [
  { label: 'A', primary: 'Competitive Programming', secondary: 'Systems', maintenance: ['Development', 'Academics'] },
  { label: 'B', primary: 'Systems', secondary: 'Development', maintenance: ['Competitive Programming', 'Academics'] },
  { label: 'C', primary: 'Development', secondary: 'Academics', maintenance: ['Competitive Programming', 'Systems'] },
  { label: 'D', primary: 'Academics', secondary: 'Competitive Programming', maintenance: ['Systems', 'Development'] },
];

function getWeekNumber(cycleStartDate, currentDate) {
  const start = new Date(cycleStartDate);
  const current = new Date(currentDate);
  const diffMs = current - start;
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return ((diffWeeks % 4) + 4) % 4; // always 0-3
}

function getCurrentRotation(cycleStartDate, currentDate) {
  const weekIndex = getWeekNumber(cycleStartDate, currentDate || new Date().toISOString().split('T')[0]);
  return { ...ROTATION[weekIndex], weekIndex };
}

function checkAcademicOverride(tasks, rotation) {
  // If any deadline task with pillar=Academics has deadline < 7 days away
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const urgentAcademic = tasks.some(t => {
    if (t.pillar_name === 'Academics' && t.type === 'deadline' && t.deadline && t.status !== 'completed') {
      const deadline = new Date(t.deadline);
      return deadline <= sevenDays && deadline >= now;
    }
    return false;
  });

  if (urgentAcademic && rotation.primary !== 'Academics') {
    return {
      ...rotation,
      original_primary: rotation.primary,
      primary: 'Academics',
      secondary: rotation.primary,
      maintenance: rotation.maintenance.filter(m => m !== 'Academics').concat([rotation.secondary]),
      overridden: true,
    };
  }

  return { ...rotation, overridden: false };
}

module.exports = { getCurrentRotation, checkAcademicOverride, ROTATION, getWeekNumber };

import { colors } from '../theme';
import type { Goal, GoalTask, Task } from '../types/models';

// Parses "YYYY-MM-DD" as a local date. `new Date(dateStr)` would parse it as
// UTC midnight, which renders as the previous day in negative-UTC timezones.
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateLong(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatTime(value: string): string {
  const date = value.includes('T') ? new Date(value) : new Date(`1970-01-01T${value}`);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function statusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'achieved':
      return colors.success;
    case 'in_progress':
    case 'started':
      return colors.accent;
    case 'missed':
    case 'paused':
      return colors.danger;
    default:
      return colors.textMuted;
  }
}

export function taskProgress(task: Task): number | null {
  if (task.recurrence_target_days <= 0) return null;
  return task.recurrence_completed_days / task.recurrence_target_days;
}

export function goalProgress(goal: Goal, links: GoalTask[], tasks: Task[]): number {
  const goalLinks = links.filter((l) => l.goal_id === goal.id);
  if (goalLinks.length === 0) return 0;

  let required = 0;
  let completed = 0;
  goalLinks.forEach((link) => {
    const task = tasks.find((t) => t.id === link.task_id);
    required += link.no_of_times_task;
    if (!task) return;
    completed += task.recurrence_target_days > 0
      ? Math.min(task.recurrence_completed_days, link.no_of_times_task)
      : task.status === 'completed'
        ? link.no_of_times_task
        : 0;
  });

  return required > 0 ? completed / required : 0;
}

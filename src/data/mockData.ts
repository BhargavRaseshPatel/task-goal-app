import type {
  Achievement,
  ActivityLog,
  DailyActivity,
  Goal,
  GoalTask,
  Priority,
  Tag,
  Task,
  TaskDay,
  TaskRecurrence,
  TaskTag,
  User,
} from '../types/models';

export const currentUser: User = {
  id: 1,
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  created_at: '2025-11-01T09:00:00Z',
};

export const priorities: Priority[] = [
  { id: 1, name: 'Critical', color: '#DC2626', created_at: '2025-11-01T09:00:00Z' },   // Red
  { id: 2, name: 'High', color: '#F97316', created_at: '2025-11-01T09:00:00Z' },       // Orange
  { id: 3, name: 'Medium', color: '#FACC15', created_at: '2025-11-01T09:00:00Z' },     // Yellow
  { id: 4, name: 'Low', color: '#22C55E', created_at: '2025-11-01T09:00:00Z' },        // Green
];

export const tags: Tag[] = [
  { id: 1, user_id: 1, name: 'Work', color: '#1E3A8A', created_at: '2025-11-01T09:00:00Z' },
  { id: 2, user_id: 1, name: 'Personal', color: '#F4975A', created_at: '2025-11-01T09:00:00Z' },
  { id: 3, user_id: 1, name: 'Health', color: '#22C55E', created_at: '2025-11-01T09:00:00Z' },
  { id: 4, user_id: 1, name: 'Study', color: '#8B5CF6', created_at: '2025-11-01T09:00:00Z' },
];

export const tasks: Task[] = [];

// Detail/join rows of a task -- cleared alongside `tasks` since they'd
// otherwise be orphaned references (task_id pointing at nothing).
export const taskTags: TaskTag[] = [];
export const taskRecurrences: TaskRecurrence[] = [];
export const taskDays: TaskDay[] = [];

export const activityLogs: ActivityLog[] = [];

export const dailyActivities: DailyActivity[] = [];

export const goals: Goal[] = [];

// Join rows of a goal -- cleared alongside `goals`/`tasks` for the same
// orphaned-reference reason as taskTags/taskRecurrences/taskDays above.
export const goalTasks: GoalTask[] = [];

export const achievements: Achievement[] = [];

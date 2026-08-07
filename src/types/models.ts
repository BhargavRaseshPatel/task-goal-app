export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type TaskDayStatus = 'not_started' | 'started' | 'completed' | 'missed';
export type GoalStatus = 'not_started' | 'in_progress' | 'achieved' | 'missed';
export type AchievementType = 'task_completed' | 'recurrence_completed' | 'goal_achieved';
export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Priority {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  priority_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: TaskStatus;
  recurrence_target_days: number;
  recurrence_completed_days: number;
  is_recurrence_completed: boolean;
  created_at: string;
}

export interface TaskTag {
  task_id: number;
  tag_id: number;
}

export interface TaskRecurrence {
  id: number;
  task_id: number;
  day_name: DayName;
}

export interface TaskDay {
  id: number;
  task_id: number;
  day_date: string;
  planned_start?: string;
  planned_end?: string;
  status: TaskDayStatus;
  rating?: number;
  review?: string;
}

export interface ActivityLog {
  id: number;
  task_day_id: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface DailyActivity {
  id: number;
  user_id: number;
  tag_id?: number;
  title: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  target_date: string;
  status: GoalStatus;
  created_at: string;
  // Not in the original schema image — added at the user's explicit request
  // for a per-goal visual identity (2026-08-02, see DECISIONS.md). Frontend
  // only for now since Goals aren't backed by MongoDB yet.
  color: string;
}

export interface GoalTask {
  id: number;
  goal_id: number;
  task_id: number;
  no_of_times_task: number;
}

export interface Achievement {
  id: number;
  user_id: number;
  achievement_type: AchievementType;
  reference_id: number;
  title: string;
  achieved_at: string;
}

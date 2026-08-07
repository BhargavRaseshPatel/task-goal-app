import React, { createContext, useContext, useState } from 'react';
import type { ActivityLog, DailyActivity, DayName, Goal, GoalTask, Priority, Tag, Task, TaskDay, TaskRecurrence, TaskTag } from '../types/models';
import * as seed from '../data/mockData';

function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

type NewTask = Omit<Task, 'id' | 'created_at'>;
type NewGoal = Omit<Goal, 'id' | 'created_at'>;
type NewTag = Omit<Tag, 'id' | 'created_at'>;
type NewPriority = Omit<Priority, 'id' | 'created_at'>;
type GoalLink = { taskId: number; noOfTimes: number };

type DataContextValue = {
  tasks: Task[];
  tags: Tag[];
  priorities: Priority[];
  taskTags: TaskTag[];
  taskDays: TaskDay[];
  activityLogs: ActivityLog[];
  goals: Goal[];
  goalTasks: GoalTask[];
  dailyActivities: DailyActivity[];
  achievements: typeof seed.achievements;

  taskRecurrences: TaskRecurrence[];

  addTask: (task: NewTask, tagIds: number[], recurrenceDays: DayName[]) => Task;
  createUrgentTask: (title: string, startNow: boolean) => Task;
  updateTask: (id: number, updates: Partial<NewTask>, tagIds: number[], recurrenceDays: DayName[]) => void;
  tagsForTask: (taskId: number) => Tag[];
  recurrenceDaysForTask: (taskId: number) => DayName[];

  addTag: (tag: NewTag) => Tag;
  updateTag: (id: number, updates: Partial<NewTag>) => void;
  deleteTag: (id: number) => void;

  addPriority: (priority: NewPriority) => Priority;
  updatePriority: (id: number, updates: Partial<NewPriority>) => void;

  addGoal: (goal: NewGoal, links: GoalLink[]) => Goal;
  updateGoal: (id: number, updates: Partial<NewGoal>, links: GoalLink[]) => void;
  goalTasksFor: (goalId: number) => GoalTask[];

  runningSession: () => RunningSession | null;
  startableDayIdForTask: (taskId: number) => number | undefined;
  startActivityLog: (taskDayId: number) => void;
  startTaskToday: (taskId: number) => void;
  stopActivityLog: (logId: number) => void;
  startDailyActivity: (title: string) => void;
  stopDailyActivity: (id: number) => void;
  quickBreak: (title: string) => void;

  // Pause/resume for the running TASK session. `pausedSeconds` is the frozen
  // elapsed at the moment of pause (null = not paused). Resume shifts the
  // log's start_time forward so the timer continues from that frozen value,
  // and stop uses it so paused wall-clock time is excluded from the total.
  pausedSeconds: number | null;
  pauseTracking: () => void;
  resumeTracking: () => void;

  // Marks a task completed. If it's the task currently being timed, ends
  // that Activity_Log first (honoring a frozen pause) so the finished
  // session is recorded, then marks the relevant Task_Day completed too.
  completeTask: (taskId: number) => void;
};

export type RunningSession =
  | { kind: 'task'; log: ActivityLog; taskDay: TaskDay; task: Task }
  | { kind: 'daily'; activity: DailyActivity };

const DataContext = createContext<DataContextValue | undefined>(undefined);

// These mock entities aren't tied to the authenticated user (that's a Mongo
// ObjectId string, these are local-only numeric ids) — fixed placeholder
// owner until Tasks/Goals/Tags/Priorities get a real backend.
const MOCK_OWNER_ID = 1;

// Matches the fixed mock "today" used by Dashboard/Calendar so a new urgent
// task's day shows up under Today's Tasks immediately.
const TODAY = '2026-08-02';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seed.tasks);
  const [tags, setTags] = useState<Tag[]>(seed.tags);
  const [priorities, setPriorities] = useState<Priority[]>(seed.priorities);
  const [taskTags, setTaskTags] = useState<TaskTag[]>(seed.taskTags);
  const [taskRecurrences, setTaskRecurrences] = useState<TaskRecurrence[]>(seed.taskRecurrences);
  const [goals, setGoals] = useState<Goal[]>(seed.goals);
  const [goalTasks, setGoalTasks] = useState<GoalTask[]>(seed.goalTasks);
  const [taskDays, setTaskDays] = useState<TaskDay[]>(seed.taskDays);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(seed.activityLogs);
  const [pausedSeconds, setPausedSeconds] = useState<number | null>(null);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>(seed.dailyActivities);

  const addTask: DataContextValue['addTask'] = (task, tagIds, recurrenceDays) => {
    const newTask: Task = { ...task, id: nextId(tasks), created_at: new Date().toISOString() };
    setTasks((prev) => [...prev, newTask]);
    setTaskTags((prev) => [...prev, ...tagIds.map((tagId) => ({ task_id: newTask.id, tag_id: tagId }))]);
    setTaskRecurrences((prev) => {
      const base = nextId(prev);
      return [...prev, ...recurrenceDays.map((day_name, idx) => ({ id: base + idx, task_id: newTask.id, day_name }))];
    });
    return newTask;
  };

  // Creates a Critical-priority task for today plus its one TaskDay (no
  // create flow makes a TaskDay today -- Activity_Logs need one to attach
  // to). When startNow, ends whatever's currently running (task or break,
  // honoring a frozen pause) and starts tracking this task's day instead.
  const createUrgentTask: DataContextValue['createUrgentTask'] = (title, startNow) => {
    const critical = priorities.find((p) => p.name === 'Critical') ?? priorities[0];
    const newTask = addTask(
      {
        user_id: MOCK_OWNER_ID,
        priority_id: critical.id,
        title,
        start_date: TODAY,
        status: startNow ? 'in_progress' : 'not_started',
        recurrence_target_days: 0,
        recurrence_completed_days: 0,
        is_recurrence_completed: false,
      },
      [],
      [],
    );

    const newDay: TaskDay = {
      id: nextId(taskDays),
      task_id: newTask.id,
      day_date: TODAY,
      status: 'not_started',
    };
    setTaskDays((prev) => [...prev, newDay]);

    if (startNow) {
      const current = runningSession();
      const end = new Date();
      if (current?.kind === 'task') {
        const log = current.log;
        const seconds = pausedSeconds != null ? pausedSeconds : (end.getTime() - new Date(log.start_time).getTime()) / 1000;
        setActivityLogs((prev) =>
          prev.map((l) => (l.id === log.id ? { ...l, end_time: end.toISOString(), duration_minutes: Math.max(1, Math.round(seconds / 60)) } : l)),
        );
        setPausedSeconds(null);
      } else if (current?.kind === 'daily') {
        const activity = current.activity;
        const duration_minutes = Math.max(1, Math.round((end.getTime() - new Date(activity.start_time).getTime()) / 60000));
        setDailyActivities((prev) => prev.map((a) => (a.id === activity.id ? { ...a, end_time: end.toISOString(), duration_minutes } : a)));
      }

      const newLog: ActivityLog = {
        id: nextId(activityLogs),
        task_day_id: newDay.id,
        start_time: end.toISOString(),
        created_at: end.toISOString(),
      };
      setActivityLogs((prev) => [...prev, newLog]);
      setTaskDays((prev) => prev.map((d) => (d.id === newDay.id ? { ...d, status: 'started' } : d)));
    }

    return newTask;
  };

  const updateTask: DataContextValue['updateTask'] = (id, updates, tagIds, recurrenceDays) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setTaskTags((prev) => [
      ...prev.filter((tt) => tt.task_id !== id),
      ...tagIds.map((tagId) => ({ task_id: id, tag_id: tagId })),
    ]);
    setTaskRecurrences((prev) => {
      const withoutTask = prev.filter((tr) => tr.task_id !== id);
      const base = nextId(prev);
      return [...withoutTask, ...recurrenceDays.map((day_name, idx) => ({ id: base + idx, task_id: id, day_name }))];
    });
  };

  const tagsForTask = (taskId: number) =>
    taskTags
      .filter((tt) => tt.task_id === taskId)
      .map((tt) => tags.find((t) => t.id === tt.tag_id))
      .filter((t): t is Tag => !!t);

  const recurrenceDaysForTask = (taskId: number) =>
    taskRecurrences.filter((tr) => tr.task_id === taskId).map((tr) => tr.day_name);

  const addTag: DataContextValue['addTag'] = (tag) => {
    const newTag: Tag = { ...tag, id: nextId(tags), created_at: new Date().toISOString() };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const updateTag: DataContextValue['updateTag'] = (id, updates) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTag: DataContextValue['deleteTag'] = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setTaskTags((prev) => prev.filter((tt) => tt.tag_id !== id));
  };

  const addPriority: DataContextValue['addPriority'] = (priority) => {
    const newPriority: Priority = { ...priority, id: nextId(priorities), created_at: new Date().toISOString() };
    setPriorities((prev) => [...prev, newPriority]);
    return newPriority;
  };

  const updatePriority: DataContextValue['updatePriority'] = (id, updates) => {
    setPriorities((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addGoal: DataContextValue['addGoal'] = (goal, links) => {
    const newGoal: Goal = { ...goal, id: nextId(goals), created_at: new Date().toISOString() };
    setGoals((prev) => [...prev, newGoal]);
    setGoalTasks((prev) => {
      const base = nextId(prev);
      return [
        ...prev,
        ...links.map((l, idx) => ({ id: base + idx, goal_id: newGoal.id, task_id: l.taskId, no_of_times_task: l.noOfTimes })),
      ];
    });
    return newGoal;
  };

  const updateGoal: DataContextValue['updateGoal'] = (id, updates, links) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    setGoalTasks((prev) => {
      const withoutGoal = prev.filter((gt) => gt.goal_id !== id);
      const base = nextId(prev);
      return [
        ...withoutGoal,
        ...links.map((l, idx) => ({ id: base + idx, goal_id: id, task_id: l.taskId, no_of_times_task: l.noOfTimes })),
      ];
    });
  };

  const goalTasksFor = (goalId: number) => goalTasks.filter((gt) => gt.goal_id === goalId);

  // Only one thing can run at a time, whether it's a task's Activity Log or
  // a Daily Activity break — both are just rows with a nullable end_time,
  // so "running" is simply "any row across either table with no end_time".
  const runningSession: DataContextValue['runningSession'] = () => {
    const log = activityLogs.find((l) => !l.end_time);
    if (log) {
      const taskDay = taskDays.find((d) => d.id === log.task_day_id);
      const task = taskDay && tasks.find((t) => t.id === taskDay.task_id);
      if (taskDay && task) return { kind: 'task', log, taskDay, task };
    }
    const activity = dailyActivities.find((a) => !a.end_time);
    if (activity) return { kind: 'daily', activity };
    return null;
  };

  // Which Task_Day a "start tracking" action should attach its log to:
  // the first day still needing work, else the first day at all so a task
  // whose days are all completed can still be resumed. undefined = the task
  // has no Task_Days, so there's nothing to attach a log to.
  const startableDayIdForTask: DataContextValue['startableDayIdForTask'] = (taskId) => {
    const days = taskDays.filter((d) => d.task_id === taskId);
    return (days.find((d) => d.status !== 'completed') ?? days[0])?.id;
  };

  const startActivityLog: DataContextValue['startActivityLog'] = (taskDayId) => {
    if (runningSession()) return;
    setPausedSeconds(null);
    const newLog: ActivityLog = {
      id: nextId(activityLogs),
      task_day_id: taskDayId,
      start_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [...prev, newLog]);
    setTaskDays((prev) => prev.map((d) => (d.id === taskDayId && d.status === 'not_started' ? { ...d, status: 'started' } : d)));
  };

  // Starts tracking a task right now, for any task -- not just ones that
  // already happen to have a Task_Day scheduled. Reuses today's Task_Day if
  // one already exists, otherwise creates it on the fly. Without this, a
  // "Start" button anywhere (Tasks list, Goal Details) would only ever work
  // for tasks that already have a day on the books, which for a normal task
  // created through the full Add Task form is never true -- only
  // createUrgentTask creates one today.
  const startTaskToday: DataContextValue['startTaskToday'] = (taskId) => {
    if (runningSession()) return;
    const existing = taskDays.find((d) => d.task_id === taskId && d.day_date === TODAY);
    const dayId = existing ? existing.id : nextId(taskDays);
    if (!existing) {
      const newDay: TaskDay = { id: dayId, task_id: taskId, day_date: TODAY, status: 'not_started' };
      setTaskDays((prev) => [...prev, newDay]);
    }
    startActivityLog(dayId);
  };

  const stopActivityLog: DataContextValue['stopActivityLog'] = (logId) => {
    const frozen = pausedSeconds;
    setActivityLogs((prev) =>
      prev.map((l) => {
        if (l.id !== logId || l.end_time) return l;
        const end = new Date();
        const seconds = frozen != null ? frozen : (end.getTime() - new Date(l.start_time).getTime()) / 1000;
        return { ...l, end_time: end.toISOString(), duration_minutes: Math.max(1, Math.round(seconds / 60)) };
      }),
    );
    setPausedSeconds(null);
  };

  const pauseTracking: DataContextValue['pauseTracking'] = () => {
    const r = runningSession();
    if (r?.kind !== 'task') return;
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(r.log.start_time).getTime()) / 1000));
    setPausedSeconds(seconds);
  };

  const resumeTracking: DataContextValue['resumeTracking'] = () => {
    const r = runningSession();
    if (r?.kind !== 'task' || pausedSeconds == null) return;
    const shiftedStart = new Date(Date.now() - pausedSeconds * 1000).toISOString();
    setActivityLogs((prev) => prev.map((l) => (l.id === r.log.id ? { ...l, start_time: shiftedStart } : l)));
    setPausedSeconds(null);
  };

  const completeTask: DataContextValue['completeTask'] = (taskId) => {
    const current = runningSession();
    if (current?.kind === 'task' && current.task.id === taskId) {
      const log = current.log;
      const end = new Date();
      const seconds = pausedSeconds != null ? pausedSeconds : (end.getTime() - new Date(log.start_time).getTime()) / 1000;
      setActivityLogs((prev) =>
        prev.map((l) => (l.id === log.id ? { ...l, end_time: end.toISOString(), duration_minutes: Math.max(1, Math.round(seconds / 60)) } : l)),
      );
      setPausedSeconds(null);
      setTaskDays((prev) => prev.map((d) => (d.id === current.taskDay.id ? { ...d, status: 'completed' } : d)));
    } else {
      const dayId = startableDayIdForTask(taskId);
      if (dayId !== undefined) setTaskDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, status: 'completed' } : d)));
    }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t)));
  };

  const startDailyActivity: DataContextValue['startDailyActivity'] = (title) => {
    if (runningSession()) return;
    const newActivity: DailyActivity = {
      id: nextId(dailyActivities),
      user_id: MOCK_OWNER_ID,
      title,
      start_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setDailyActivities((prev) => [...prev, newActivity]);
  };

  const stopDailyActivity: DataContextValue['stopDailyActivity'] = (id) => {
    setDailyActivities((prev) =>
      prev.map((a) => {
        if (a.id !== id || a.end_time) return a;
        const end = new Date();
        const duration_minutes = Math.max(1, Math.round((end.getTime() - new Date(a.start_time).getTime()) / 60000));
        return { ...a, end_time: end.toISOString(), duration_minutes };
      }),
    );
  };

  // Stops whatever's currently running (if anything) and starts a break in
  // the same call. Composing stopActivityLog() + startDailyActivity() as two
  // separate calls wouldn't work here — startDailyActivity's own
  // runningSession() guard would still see the old (not-yet-stopped) state,
  // since setState updates land on the next render, not this closure.
  const quickBreak: DataContextValue['quickBreak'] = (title) => {
    const current = runningSession();
    const frozen = pausedSeconds;
    if (current?.kind === 'task') {
      const log = current.log;
      const end = new Date();
      const seconds = frozen != null ? frozen : (end.getTime() - new Date(log.start_time).getTime()) / 1000;
      setActivityLogs((prev) =>
        prev.map((l) => (l.id === log.id ? { ...l, end_time: end.toISOString(), duration_minutes: Math.max(1, Math.round(seconds / 60)) } : l)),
      );
    }
    setPausedSeconds(null);
    const newActivity: DailyActivity = {
      id: nextId(dailyActivities),
      user_id: MOCK_OWNER_ID,
      title,
      start_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setDailyActivities((prev) => [...prev, newActivity]);
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        tags,
        priorities,
        taskTags,
        taskRecurrences,
        taskDays,
        activityLogs,
        goals,
        goalTasks,
        dailyActivities,
        achievements: seed.achievements,
        addTask,
        createUrgentTask,
        updateTask,
        tagsForTask,
        recurrenceDaysForTask,
        addTag,
        updateTag,
        deleteTag,
        addPriority,
        updatePriority,
        addGoal,
        updateGoal,
        goalTasksFor,
        runningSession,
        startableDayIdForTask,
        startActivityLog,
        startTaskToday,
        stopActivityLog,
        startDailyActivity,
        stopDailyActivity,
        quickBreak,
        pausedSeconds,
        pauseTracking,
        resumeTracking,
        completeTask,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export { MOCK_OWNER_ID };

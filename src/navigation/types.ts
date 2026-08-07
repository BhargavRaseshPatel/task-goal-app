import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  DailyActivities: undefined;
};

export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: number };
  AddTask: undefined;
  EditTask: { taskId: number };
  TaskDays: { taskId: number };
  ActivityLogs: { taskDayId: number };
};

export type GoalsStackParamList = {
  GoalsList: undefined;
  GoalDetail: { goalId: number };
  AddGoal: undefined;
  EditGoal: { goalId: number };
};

export type CalendarStackParamList = {
  CalendarHome: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ManageTags: undefined;
  CreateTag: undefined;
  EditTag: { tagId: number };
  ManagePriorities: undefined;
  AddPriority: undefined;
  EditPriority: { priorityId: number };
  Achievements: undefined;
};

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Goals: NavigatorScreenParams<GoalsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

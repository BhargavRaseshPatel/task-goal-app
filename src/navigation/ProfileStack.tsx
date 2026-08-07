import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ManageTagsScreen from '../screens/ManageTagsScreen';
import CreateTagScreen from '../screens/CreateTagScreen';
import EditTagScreen from '../screens/EditTagScreen';
import ManagePrioritiesScreen from '../screens/ManagePrioritiesScreen';
import AddPriorityScreen from '../screens/AddPriorityScreen';
import EditPriorityScreen from '../screens/EditPriorityScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ManageTags" component={ManageTagsScreen} />
      <Stack.Screen name="CreateTag" component={CreateTagScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditTag" component={EditTagScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ManagePriorities" component={ManagePrioritiesScreen} />
      {/* <Stack.Screen name="AddPriority" component={AddPriorityScreen} options={{ presentation: 'modal' }} /> */}
      {/* <Stack.Screen name="EditPriority" component={EditPriorityScreen} options={{ presentation: 'modal' }} /> */}
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
    </Stack.Navigator>
  );
}

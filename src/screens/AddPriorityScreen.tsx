import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import PriorityForm from '../components/PriorityForm';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AddPriority'>;

export default function AddPriorityScreen({ navigation }: Props) {
  const { addPriority } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Add Priority" onBack={navigation.goBack} />
      <PriorityForm
        submitLabel="Save Priority"
        onCancel={navigation.goBack}
        onSubmit={(values) => {
          addPriority(values);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

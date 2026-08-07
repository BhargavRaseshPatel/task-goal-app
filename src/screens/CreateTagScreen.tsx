import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData, MOCK_OWNER_ID } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import TagForm from '../components/TagForm';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CreateTag'>;

export default function CreateTagScreen({ navigation }: Props) {
  const { addTag } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Create New Tag" onBack={navigation.goBack} />
      <TagForm
        submitLabel="Save"
        onCancel={navigation.goBack}
        onSubmit={(values) => {
          addTag({ ...values, user_id: MOCK_OWNER_ID });
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

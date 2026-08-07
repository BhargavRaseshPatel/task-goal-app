import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import TagForm from '../components/TagForm';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditTag'>;

export default function EditTagScreen({ navigation, route }: Props) {
  const { tags, updateTag } = useData();
  const tag = tags.find((t) => t.id === route.params.tagId);

  if (!tag) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit Tag" onBack={navigation.goBack} />
        <Text style={styles.notFound}>Tag not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit Tag" onBack={navigation.goBack} />
      <TagForm
        initial={tag}
        submitLabel="Save Changes"
        onCancel={navigation.goBack}
        onSubmit={(values) => {
          updateTag(tag.id, values);
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
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textMuted,
  },
});

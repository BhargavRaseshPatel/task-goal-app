import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useData } from '../context/DataContext';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import type { Tag } from '../types/models';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ManageTags'>;

export default function ManageTagsScreen({ navigation }: Props) {
  const { tags, taskTags, deleteTag } = useData();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Manage Tags"
        onBack={navigation.goBack}
        right={
          <Pressable onPress={() => navigation.navigate('CreateTag')} hitSlop={10}>
            <Ionicons name="add-circle" size={26} color={colors.primary} />
          </Pressable>
        }
      />
      <FlatList
        data={tags}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="No tags yet" message="Create a tag to start organizing your tasks." />}
        renderItem={({ item }) => (
          <TagRow
            tag={item}
            count={taskTags.filter((tt) => tt.tag_id === item.id).length}
            onEdit={() => navigation.navigate('EditTag', { tagId: item.id })}
            onDelete={() => deleteTag(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

function TagRow({ tag, count, onEdit, onDelete }: { tag: Tag; count: number; onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={[styles.row, { borderLeftColor: tag.color }]}>
      <View style={[styles.dot, { backgroundColor: tag.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{tag.name}</Text>
        <Text style={styles.rowSubtitle}>{count} task{count === 1 ? '' : 's'}</Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={8} style={styles.iconButton}>
        <Ionicons name="pencil" size={16} color={colors.textMuted} />
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.iconButton}>
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  iconButton: {
    padding: 6,
  },
});

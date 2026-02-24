import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useGroups } from '../../hooks/useGroups';
import { useContactLink } from '../../hooks/useContactLink';
import { Avatar } from '../../components/ui/Avatar';
import { ContactLinkButton } from '../../components/birthday/ContactLinkButton';
import { openWhatsApp, openIMessage } from '../../lib/messaging';
import { SHARE_BASE_URL } from '../../lib/constants';
import {
  getDaysUntilBirthday,
  getAge,
  formatBirthdayDate,
} from '../../lib/dateHelpers';

export default function PersonDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { birthdays, deleteBirthday, updateBirthday, generatePersonShareCode } = useBirthdays();
  const { groups } = useGroups();
  const { getContactPhone } = useContactLink();

  const person = birthdays.find((p) => p.id === id);

  if (!person) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const daysUntil = getDaysUntilBirthday(
    person.birthday_month,
    person.birthday_day
  );
  const age = getAge(
    person.birthday_year,
    person.birthday_month,
    person.birthday_day
  );
  const dateStr = formatBirthdayDate(
    person.birthday_month,
    person.birthday_day,
    person.birthday_year
  );

  const handleShare = async () => {
    try {
      const code = person.share_code || (await generatePersonShareCode(person.id));
      const shareUrl = `${SHARE_BASE_URL}?person=${code}`;
      await Share.share({
        message: `${person.name}'s birthday is on ${dateStr}! Save it on Birthminder: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Error', 'Failed to share birthday');
    }
  };

  const handleEdit = () => {
    const groupIds = person.person_groups
      ?.map((pg) => pg.group_id)
      .join(',');

    router.push({
      pathname: '/modal',
      params: {
        id: person.id,
        name: person.name,
        month: String(person.birthday_month),
        day: String(person.birthday_day),
        year: person.birthday_year ? String(person.birthday_year) : '',
        photo: person.photo_url ?? '',
        notes: person.notes ?? '',
        groups: groupIds ?? '',
        contact_id: person.contact_id ?? '',
      },
    });
  };

  const handleMessaging = async (type: 'whatsapp' | 'imessage') => {
    if (!person?.contact_id) return;
    const phone = await getContactPhone(person.contact_id);
    if (!phone) {
      Alert.alert('No Phone Number', 'No phone number found for this contact.');
      return;
    }
    if (type === 'whatsapp') {
      await openWhatsApp(phone);
    } else {
      await openIMessage(phone);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Birthday',
      `Are you sure you want to delete ${person.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBirthday(person.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={22}
              color={colors.primary}
            />
          </Pressable>
          <Pressable onPress={handleEdit}>
            <Ionicons
              name="pencil-outline"
              size={22}
              color={colors.primary}
            />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Ionicons
              name="trash-outline"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Avatar uri={person.photo_url} size={150} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {person.name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {dateStr}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {daysUntil === 0 ? 'Today!' : `${daysUntil}`}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {daysUntil === 0 ? '' : 'days left'}
          </Text>
        </View>

        {age !== null && (
          <View
            style={[styles.statCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {age}
            </Text>
            <Text
              style={[styles.statLabel, { color: colors.textSecondary }]}
            >
              turning
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Linked Contact
        </Text>
        <ContactLinkButton
          contactId={person.contact_id}
          onContactLinked={async (cid) => {
            await updateBirthday(person.id, { contact_id: cid });
          }}
          onContactUnlinked={async () => {
            await updateBirthday(person.id, { contact_id: null });
          }}
        />
      </View>

      {person.contact_id && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Send Birthday Wish
          </Text>
          <View style={styles.messagingRow}>
            <Pressable
              onPress={() => handleMessaging('whatsapp')}
              style={[styles.messagingButton, { backgroundColor: '#25D366' }]}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.messagingButtonText}>WhatsApp</Text>
            </Pressable>
            <Pressable
              onPress={() => handleMessaging('imessage')}
              style={[styles.messagingButton, { backgroundColor: '#007AFF' }]}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.messagingButtonText}>iMessage</Text>
            </Pressable>
          </View>
        </View>
      )}

      {person.person_groups && person.person_groups.length > 0 && (
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.textSecondary }]}
          >
            Groups
          </Text>
          <View style={styles.groupPills}>
            {person.person_groups.map((pg) => (
              <View
                key={pg.group_id}
                style={[
                  styles.pill,
                  {
                    backgroundColor: (groups.find(g => g.id === pg.group_id)?.color || pg.groups?.color || colors.primary) + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: groups.find(g => g.id === pg.group_id)?.color || pg.groups?.color || colors.primary },
                  ]}
                >
                  {groups.find(g => g.id === pg.group_id)?.name || pg.groups?.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {person.notes && (
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.textSecondary }]}
          >
            Notes
          </Text>
          <Text style={[styles.notesText, { color: colors.textPrimary }]}>
            {person.notes}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 18,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 16,
  },
  date: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 100,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  groupPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  notesText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 22,
  },
  messagingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  messagingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  messagingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});

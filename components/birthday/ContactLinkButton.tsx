import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useContactLink, LinkedContact } from '../../hooks/useContactLink';

interface ContactLinkButtonProps {
  contactId: string | null;
  contactName: string | null;
  onContactLinked: (contact: LinkedContact) => void;
  onContactUnlinked: () => void;
}

export function ContactLinkButton({
  contactId,
  contactName,
  onContactLinked,
  onContactUnlinked,
}: ContactLinkButtonProps) {
  const { colors } = useTheme();
  const { linking, pickContact, getContactInfo } = useContactLink();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    if (!contactId) {
      setDisplayName(null);
      return;
    }

    if (contactName) {
      // New-style: stored name available, no re-fetch needed
      setDisplayName(contactName);
      return;
    }

    // Legacy fallback: try to fetch from Contacts API
    setLoadingInfo(true);
    getContactInfo(contactId).then((info) => {
      setDisplayName(info?.name ?? null);
      setLoadingInfo(false);
    });
  }, [contactId, contactName, getContactInfo]);

  const handleLink = async () => {
    const contact = await pickContact();
    if (contact) {
      setDisplayName(contact.name);
      onContactLinked(contact);
    }
  };

  const handleUnlink = () => {
    setDisplayName(null);
    onContactUnlinked();
  };

  if (loadingInfo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  // Linked state
  if (contactId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.linkedRow}>
          <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
          <Text
            style={[styles.linkedName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {displayName ?? 'Linked contact'}
          </Text>
          <Pressable onPress={handleUnlink} style={styles.unlinkButton}>
            <Text style={[styles.unlinkText, { color: colors.textSecondary }]}>
              Unlink
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Unlinked state — show link button
  return (
    <Pressable
      onPress={handleLink}
      disabled={linking}
      style={[
        styles.container,
        styles.linkButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.bottomBarBorder,
        },
      ]}
    >
      {linking ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          <Ionicons name="person-add-outline" size={18} color={colors.primary} />
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Link to Contact
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkedName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  unlinkButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlinkText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
});

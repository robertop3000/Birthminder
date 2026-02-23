import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useContactLink, LinkedContact } from '../../hooks/useContactLink';

interface ContactLinkButtonProps {
  contactId: string | null;
  onContactLinked: (contactId: string) => void;
  onContactUnlinked: () => void;
}

export function ContactLinkButton({
  contactId,
  onContactLinked,
  onContactUnlinked,
}: ContactLinkButtonProps) {
  const { colors } = useTheme();
  const { linking, pickContact, getContactInfo } = useContactLink();
  const [linkedContact, setLinkedContact] = useState<LinkedContact | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Load contact info when contactId is set
  useEffect(() => {
    if (contactId) {
      setLoadingInfo(true);
      getContactInfo(contactId).then((info) => {
        setLinkedContact(info);
        setLoadingInfo(false);
      });
    } else {
      setLinkedContact(null);
    }
  }, [contactId, getContactInfo]);

  const handleLink = async () => {
    const contact = await pickContact();
    if (contact) {
      setLinkedContact(contact);
      onContactLinked(contact.id);
    }
  };

  const handleUnlink = () => {
    setLinkedContact(null);
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
  if (contactId && linkedContact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.linkedRow}>
          <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
          <Text
            style={[styles.linkedName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {linkedContact.name}
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

  // Linked but contact not found
  if (contactId && !linkedContact) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.linkedRow}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} />
          <Text
            style={[styles.notFoundText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            Contact not found
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
  notFoundText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
});

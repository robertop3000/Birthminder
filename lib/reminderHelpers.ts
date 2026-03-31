import { Person } from '../contexts/BirthdaysContext';
import { Group } from '../contexts/GroupsContext';

export interface EffectiveReminders {
  /** Union of all reminder days (individual + all groups), sorted ascending */
  effectiveDays: number[];
  /** Days from the person's own reminder_days setting */
  individualDays: number[];
  /** Map of day value → group names that contribute that day */
  groupSources: Map<number, string[]>;
}

export function getEffectiveReminders(
  person: Person,
  groups: Group[]
): EffectiveReminders {
  const individualDays = person.reminder_days ?? [0];
  const allDays = new Set<number>(individualDays);
  const groupSources = new Map<number, string[]>();

  // Get the group IDs this person belongs to
  const personGroupIds = new Set(
    (person.person_groups ?? []).map((pg) => pg.group_id)
  );

  // Merge reminder_days from each group the person belongs to
  for (const group of groups) {
    if (!personGroupIds.has(group.id)) continue;
    const groupDays = group.reminder_days ?? [];
    for (const day of groupDays) {
      allDays.add(day);
      const sources = groupSources.get(day) ?? [];
      sources.push(group.name);
      groupSources.set(day, sources);
    }
  }

  return {
    effectiveDays: Array.from(allDays).sort((a, b) => a - b),
    individualDays: [...individualDays].sort((a, b) => a - b),
    groupSources,
  };
}

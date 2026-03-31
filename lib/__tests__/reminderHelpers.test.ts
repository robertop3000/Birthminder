import { getEffectiveReminders } from '../reminderHelpers';
import { Person } from '../../contexts/BirthdaysContext';
import { Group } from '../../contexts/GroupsContext';

const makePerson = (overrides: Partial<Person> = {}): Person => ({
  id: 'p1',
  user_id: 'u1',
  name: 'Alice',
  birthday_day: 15,
  birthday_month: 5,
  birthday_year: null,
  photo_url: null,
  notes: null,
  share_code: null,
  contact_id: null,
  contact_phone: null,
  contact_name: null,
  reminder_days: [0],
  created_at: '2024-01-01',
  person_groups: [],
  ...overrides,
});

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g1',
  user_id: 'u1',
  name: 'Friends',
  color: '#4CAF50',
  photo_url: null,
  share_code: null,
  source_share_code: null,
  member_count: 0,
  reminder_days: [],
  created_at: '2024-01-01',
  ...overrides,
});

describe('getEffectiveReminders', () => {
  it('returns individual days when person has no groups', () => {
    const person = makePerson({ reminder_days: [0, 3] });
    const result = getEffectiveReminders(person, []);
    expect(result.effectiveDays).toEqual([0, 3]);
    expect(result.individualDays).toEqual([0, 3]);
    expect(result.groupSources.size).toBe(0);
  });

  it('merges individual and group days', () => {
    const person = makePerson({
      reminder_days: [0],
      person_groups: [{ group_id: 'g1', groups: { id: 'g1', name: 'Friends', color: '#4CAF50' } }],
    });
    const group = makeGroup({ id: 'g1', name: 'Friends', reminder_days: [1, 7] });
    const result = getEffectiveReminders(person, [group]);
    expect(result.effectiveDays).toEqual([0, 1, 7]);
    expect(result.individualDays).toEqual([0]);
  });

  it('unions days from multiple groups', () => {
    const person = makePerson({
      reminder_days: [0],
      person_groups: [
        { group_id: 'g1', groups: { id: 'g1', name: 'Family', color: '#4CAF50' } },
        { group_id: 'g2', groups: { id: 'g2', name: 'Work', color: '#2196F3' } },
      ],
    });
    const g1 = makeGroup({ id: 'g1', name: 'Family', reminder_days: [1] });
    const g2 = makeGroup({ id: 'g2', name: 'Work', reminder_days: [2] });
    const result = getEffectiveReminders(person, [g1, g2]);
    expect(result.effectiveDays).toEqual([0, 1, 2]);
  });

  it('deduplicates overlapping days', () => {
    const person = makePerson({
      reminder_days: [0, 3],
      person_groups: [{ group_id: 'g1', groups: { id: 'g1', name: 'Friends', color: '#4CAF50' } }],
    });
    const group = makeGroup({ id: 'g1', name: 'Friends', reminder_days: [3, 7] });
    const result = getEffectiveReminders(person, [group]);
    expect(result.effectiveDays).toEqual([0, 3, 7]); // 3 not duplicated
  });

  it('provides correct group attribution in groupSources', () => {
    const person = makePerson({
      reminder_days: [0],
      person_groups: [
        { group_id: 'g1', groups: { id: 'g1', name: 'Family', color: '#4CAF50' } },
        { group_id: 'g2', groups: { id: 'g2', name: 'Work', color: '#2196F3' } },
      ],
    });
    const g1 = makeGroup({ id: 'g1', name: 'Family', reminder_days: [1, 7] });
    const g2 = makeGroup({ id: 'g2', name: 'Work', reminder_days: [1] });
    const result = getEffectiveReminders(person, [g1, g2]);
    expect(result.groupSources.get(1)).toEqual(['Family', 'Work']);
    expect(result.groupSources.get(7)).toEqual(['Family']);
    expect(result.groupSources.has(0)).toBe(false); // 0 is individual only
  });

  it('ignores groups the person does not belong to', () => {
    const person = makePerson({
      reminder_days: [0],
      person_groups: [],
    });
    const group = makeGroup({ id: 'g1', name: 'Friends', reminder_days: [3] });
    const result = getEffectiveReminders(person, [group]);
    expect(result.effectiveDays).toEqual([0]);
  });

  it('handles null reminder_days on person gracefully', () => {
    const person = makePerson({ reminder_days: null as any });
    const result = getEffectiveReminders(person, []);
    expect(result.effectiveDays).toEqual([0]); // falls back to [0]
    expect(result.individualDays).toEqual([0]);
  });

  it('handles empty reminder_days on group gracefully', () => {
    const person = makePerson({
      reminder_days: [0],
      person_groups: [{ group_id: 'g1', groups: { id: 'g1', name: 'Friends', color: '#4CAF50' } }],
    });
    const group = makeGroup({ id: 'g1', name: 'Friends', reminder_days: [] });
    const result = getEffectiveReminders(person, [group]);
    expect(result.effectiveDays).toEqual([0]);
  });

  it('returns sorted effective days', () => {
    const person = makePerson({
      reminder_days: [7, 0],
      person_groups: [{ group_id: 'g1', groups: { id: 'g1', name: 'Friends', color: '#4CAF50' } }],
    });
    const group = makeGroup({ id: 'g1', name: 'Friends', reminder_days: [3] });
    const result = getEffectiveReminders(person, [group]);
    expect(result.effectiveDays).toEqual([0, 3, 7]);
  });
});

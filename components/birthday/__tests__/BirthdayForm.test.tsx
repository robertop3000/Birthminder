import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BirthdayForm, BirthdayFormData } from '../BirthdayForm';

// Override the useGroups mock for this test
jest.mock('../../../hooks/useGroups', () => ({
  useGroups: () => ({
    groups: [
      { id: 'g1', name: 'Family', color: '#E07A5F', member_count: 3 },
      { id: 'g2', name: 'Friends', color: '#81B29A', member_count: 5 },
    ],
    loading: false,
    error: null,
    addGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    generateShareCode: jest.fn(),
    refetch: jest.fn(),
  }),
}));

describe('BirthdayForm', () => {
  const mockSubmit = jest.fn();
  const mockCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    const { getByPlaceholderText, getByText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    expect(getByPlaceholderText("Person's name")).toBeTruthy();
    expect(getByPlaceholderText('DD')).toBeTruthy();
    expect(getByPlaceholderText('YYYY')).toBeTruthy();
    expect(getByText('January')).toBeTruthy(); // Default month
    expect(getByText('Save')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onCancel when Cancel is pressed', () => {
    const { getByText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('shows alert when submitting without a name', () => {
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    // Set day but leave name empty
    fireEvent.changeText(getByPlaceholderText('DD'), '15');
    fireEvent.press(getByText('Save'));

    expect(alertSpy).toHaveBeenCalledWith('Please enter a name');
    expect(mockSubmit).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows alert when submitting without a valid day', () => {
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    fireEvent.changeText(getByPlaceholderText("Person's name"), 'John');
    // Don't enter a day
    fireEvent.press(getByText('Save'));

    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid day (1-31)');
    expect(mockSubmit).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('calls onSubmit with correct data when form is valid', () => {
    const { getByPlaceholderText, getByText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    fireEvent.changeText(getByPlaceholderText("Person's name"), 'Jane Doe');
    fireEvent.changeText(getByPlaceholderText('DD'), '25');
    fireEvent.changeText(getByPlaceholderText('YYYY'), '1990');
    fireEvent.changeText(
      getByPlaceholderText('Gift ideas, memories...'),
      'Loves chocolate'
    );

    fireEvent.press(getByText('Save'));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      birthday_month: 1, // Default January
      birthday_day: 25,
      birthday_year: 1990,
      photo_uri: null,
      notes: 'Loves chocolate',
      group_ids: [],
      contact_id: null,
    });
  });

  it('handles group selection', () => {
    const { getByText, getByPlaceholderText } = render(
      <BirthdayForm onSubmit={mockSubmit} onCancel={mockCancel} />
    );

    // Select "Family" group
    fireEvent.press(getByText('Family'));

    // Fill required fields and submit
    fireEvent.changeText(getByPlaceholderText("Person's name"), 'Bob');
    fireEvent.changeText(getByPlaceholderText('DD'), '10');
    fireEvent.press(getByText('Save'));

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Bob',
        group_ids: ['g1'],
      })
    );
  });

  it('pre-fills form when initialValues are provided', () => {
    const { getByDisplayValue } = render(
      <BirthdayForm
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        initialValues={{
          name: 'Alice',
          birthday_month: 6,
          birthday_day: 15,
          birthday_year: 1985,
          notes: 'Best friend',
        }}
      />
    );

    expect(getByDisplayValue('Alice')).toBeTruthy();
    expect(getByDisplayValue('15')).toBeTruthy();
    expect(getByDisplayValue('1985')).toBeTruthy();
    expect(getByDisplayValue('Best friend')).toBeTruthy();
  });

  it('shows Saving... text when loading is true', () => {
    const { getByText } = render(
      <BirthdayForm
        onSubmit={mockSubmit}
        onCancel={mockCancel}
        loading={true}
      />
    );

    expect(getByText('Saving...')).toBeTruthy();
  });
});

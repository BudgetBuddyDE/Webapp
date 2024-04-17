import {describe, it, expect} from 'vitest';
import {type TCategoryInputOption, applyCategoryOptionsFilter} from './CategoryAutocomplete.component';

/**
 * Provided options
 * Work, Rent, Other, Office, Offgrid
 *
 * Cases
 * work => Work, Create "work"
 * Work => Work
 * wor => Work, Create "wor"
 */
describe('Validate if correct items are returned by filter', () => {
  const filterOptionsState = (keyword: string) => ({
    inputValue: keyword,
    getOptionLabel(option: TCategoryInputOption) {
      return option.label;
    },
  });
  const options: TCategoryInputOption[] = [
    {label: 'Work', value: '1'},
    {label: 'Rent', value: '2'},
    {label: 'Other', value: '3'},
    {label: 'Office', value: '4'},
    {label: 'Offgrid', value: '5'},
  ];

  it('filters options based on inputValue', () => {
    const state = filterOptionsState('work');
    const filteredOptions = applyCategoryOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "work"', value: -1},
      {label: 'Work', value: '1'},
    ]);
  });

  it('selects exact match without creating', () => {
    const state = filterOptionsState('Rent');
    const filteredOptions = applyCategoryOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(1);
    expect(filteredOptions).toEqual([{label: 'Rent', value: '2'}]);
  });

  it('filters options and creates when no exact match', () => {
    const state = filterOptionsState('wor');
    const filteredOptions = applyCategoryOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "wor"', value: -1},
      {label: 'Work', value: '1'},
    ]);
  });

  it('filters options and creates when no exact match (multiple partially matches)', () => {
    const state = filterOptionsState('off');
    const filteredOptions = applyCategoryOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(3);
    expect(filteredOptions).toEqual([
      {shouldCreate: true, label: 'Create "off"', value: -1},
      {label: 'Office', value: '4'},
      {label: 'Offgrid', value: '5'},
    ]);
  });

  it('returns all options when inputValue is empty', () => {
    const state = filterOptionsState('');
    const filteredOptions = applyCategoryOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(5);
    expect(filteredOptions).toEqual(options);
  });
});

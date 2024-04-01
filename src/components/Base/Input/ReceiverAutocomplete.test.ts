import {type TAutocompleteOption, applyReceiverOptionsFilter} from './ReceiverAutocomplete.component';

describe('Validate if correct items are returned by filter', () => {
  const filterOptionsState = (keyword: string) => ({
    inputValue: keyword,
    getOptionLabel(option: TAutocompleteOption) {
      return option.label;
    },
  });
  const options: TAutocompleteOption[] = [
    {label: 'Landlord', value: 'Landlord'},
    {label: 'McDonalds', value: 'McDonalds'},
    {label: 'State Office', value: 'State Office'},
    {label: 'Tax Office', value: 'Tax Office'},
  ];

  it('filters options based on inputValue', () => {
    const state = filterOptionsState('landlord');
    const filteredOptions = applyReceiverOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {label: 'Create "landlord"', value: 'landlord'},
      {label: 'Landlord', value: 'Landlord'},
    ]);
  });

  it('selects exact match without creating', () => {
    const state = filterOptionsState('Landlord');
    const filteredOptions = applyReceiverOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(1);
    expect(filteredOptions).toEqual([{label: 'Landlord', value: 'Landlord'}]);
  });

  it('filters options and creates when no exact match', () => {
    const state = filterOptionsState('land');
    const filteredOptions = applyReceiverOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(2);
    expect(filteredOptions).toEqual([
      {label: 'Create "land"', value: 'land'},
      {label: 'Landlord', value: 'Landlord'},
    ]);
  });

  it('filters options and creates when no exact match (multiple partially matches)', () => {
    const state = filterOptionsState('off');
    const filteredOptions = applyReceiverOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(3);
    expect(filteredOptions).toEqual([
      {label: 'Create "off"', value: 'off'},
      {label: 'State Office', value: 'State Office'},
      {label: 'Tax Office', value: 'Tax Office'},
    ]);
  });

  it('returns all options when inputValue is empty', () => {
    const state = filterOptionsState('');
    const filteredOptions = applyReceiverOptionsFilter(options, state);
    expect(filteredOptions.length).toBe(4);
    expect(filteredOptions).toEqual(options);
  });
});

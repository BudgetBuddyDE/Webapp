import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {PasswordInput} from './PasswordInput.component';

describe('PasswordInput', () => {
  it('toggles password visibility when the toggle button is clicked', () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByLabelText('toggle password visibility');
    const passwordInput = screen.getByPlaceholderText('Enter password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { settings } from '../../data/repo.ts';
import { freshData, renderAt } from '../../test/render.tsx';
import SettingsPage from './SettingsPage.tsx';

describe('SettingsPage', () => {
  beforeEach(async () => {
    await freshData();
  });

  it('changes the theme and the participant code', async () => {
    const user = userEvent.setup();
    renderAt('/settings', <SettingsPage />);
    await user.click(screen.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(settings.get().theme).toBe('dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    const before = settings.get().participantCode;
    await user.click(screen.getByRole('button', { name: 'Give me a new code' }));
    await waitFor(() => expect(settings.get().participantCode).not.toBe(before));
    expect(settings.get().participantCode).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('keeps teacher settings inside their ranges', async () => {
    const user = userEvent.setup();
    renderAt('/settings', <SettingsPage />);
    await user.click(screen.getByText('Teacher settings'));
    const input = screen.getByLabelText('Seconds per painting');
    await user.clear(input);
    await user.type(input, '2');
    await waitFor(() => expect(settings.get().teacher.secondsPerPainting).toBe(2));
    await user.clear(input);
    await user.type(input, '99');
    expect(settings.get().teacher.secondsPerPainting).toBe(2);
    await user.click(screen.getByRole('button', { name: 'Back to the research defaults' }));
    await waitFor(() => expect(settings.get().teacher.secondsPerPainting).toBe(3));
  });
});

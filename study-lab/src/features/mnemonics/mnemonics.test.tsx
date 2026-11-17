import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { mnemonics } from '../../data/repo.ts';
import { freshData, renderAt } from '../../test/render.tsx';
import MnemonicEditorPage from './MnemonicEditorPage.tsx';
import MnemonicsPage from './MnemonicsPage.tsx';
import { chunkDigits } from './kinds.ts';

describe('mnemonics', () => {
  beforeEach(async () => {
    await freshData();
  });

  it('shows first letters while typing a list and saves an acronym', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/mnemonics/new', <MnemonicEditorPage />, {
      extraRoutes: [{ path: '/mnemonics', element: <MnemonicsPage /> }],
    });
    await user.type(screen.getByLabelText(/short title/), 'Rainbow colours');
    await user.type(screen.getByLabelText(/list to remember/), 'violet\nindigo\nblue\ngreen');
    expect(screen.getByText('VIBG')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^The acronym/), 'VIBG');
    await user.click(screen.getByRole('button', { name: 'Save the mnemonic' }));
    await waitFor(() => expect(mnemonics.all()).toHaveLength(1));
    expect(mnemonics.all()[0]?.kind).toBe('acronym');
    await waitFor(() => expect(router.state.location.pathname).toBe('/mnemonics'));
    expect(await screen.findByRole('link', { name: 'Rainbow colours' })).toBeInTheDocument();
  });

  it('refuses to save an empty mnemonic', async () => {
    const user = userEvent.setup();
    renderAt('/mnemonics/new', <MnemonicEditorPage />);
    await user.click(screen.getByRole('button', { name: 'Save the mnemonic' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Give it a title/);
    expect(mnemonics.all()).toHaveLength(0);
  });

  it('chunks digits', () => {
    expect(chunkDigits('299792458')).toEqual(['299', '792', '458']);
    expect(chunkDigits('3.14159', 4)).toEqual(['3141', '59']);
    expect(chunkDigits('abc')).toEqual([]);
  });
});

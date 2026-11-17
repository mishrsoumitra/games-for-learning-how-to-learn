import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { cards, decks } from '../../data/repo.ts';
import { freshData, renderAt } from '../../test/render.tsx';
import DeckPage from './DeckPage.tsx';
import DecksPage from './DecksPage.tsx';
import ReviewPage from './ReviewPage.tsx';

describe('flashcards', () => {
  beforeEach(async () => {
    await freshData();
  });

  it('creates a deck and navigates to it', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/flashcards', <DecksPage />, {
      extraRoutes: [{ path: '/flashcards/:deckId', element: <DeckPage /> }],
    });
    expect(screen.getByText(/No decks yet/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Deck name'), 'Physics unit 2');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(router.state.location.pathname).toMatch(/^\/flashcards\/.+/));
    expect(decks.all()).toHaveLength(1);
    expect(await screen.findByRole('heading', { name: 'Physics unit 2' })).toBeInTheDocument();
  });

  it('adds cards one at a time and by pasting', async () => {
    const user = userEvent.setup();
    const t = new Date().toISOString();
    await decks.put({ id: 'd1', name: 'Maths', description: '', createdAt: t, updatedAt: t });
    renderAt('/flashcards/d1', <DeckPage />, { routePath: '/flashcards/:deckId' });
    await user.type(screen.getByLabelText(/Front/), 'derivative of sin x');
    await user.type(screen.getByLabelText(/Back/), 'cos x');
    await user.click(screen.getByRole('button', { name: 'Add card' }));
    await waitFor(() => expect(cards.all()).toHaveLength(1));
    await user.type(
      screen.getByLabelText('Cards to paste'),
      'derivative of cos x :: -sin x\nderivative of e^x :: e^x',
    );
    await user.click(screen.getByRole('button', { name: 'Add these cards' }));
    await waitFor(() => expect(cards.all()).toHaveLength(3));
    expect(screen.getByText('Added 2 cards.')).toBeInTheDocument();
    expect(screen.getByText('3 cards')).toBeInTheDocument();
  });

  it('reviews a due card: type, reveal, grade, and the card is rescheduled', async () => {
    const user = userEvent.setup();
    const t = new Date().toISOString();
    await decks.put({ id: 'd1', name: 'Maths', description: '', createdAt: t, updatedAt: t });
    await cards.put({
      id: 'c1',
      deckId: 'd1',
      front: 'derivative of sin x',
      back: 'cos x',
      hint: '',
      mnemonicId: null,
      tags: [],
      createdAt: t,
      updatedAt: t,
      review: { due: t, intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 },
    });
    renderAt('/flashcards/d1/review', <ReviewPage />, { routePath: '/flashcards/:deckId/review' });
    expect(screen.getByText('derivative of sin x')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Type your answer/), 'cos x');
    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    expect(screen.getByText('That matches.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Good/ }));
    await waitFor(() => expect(cards.get('c1')?.review.reps).toBe(1));
    expect(cards.get('c1')?.review.intervalDays).toBe(1);
    expect(await screen.findByRole('heading', { name: 'Session done' })).toBeInTheDocument();
  });
});

import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createRun } from '../../activities/common.ts';
import { createPlan } from '../../activities/interleaving/engine.ts';
import { TeacherSettingsSchema } from '../../data/schemas.ts';
import { freshData, renderAt } from '../../test/render.tsx';
import HomePage from './HomePage.tsx';

describe('HomePage', () => {
  beforeEach(async () => {
    await freshData();
  });

  it('lists the four activities and says nothing is waiting', () => {
    renderAt('/', <HomePage />);
    expect(screen.getByRole('heading', { name: 'Study Lab' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mixed or blocked' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reread or recall' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cram or space' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mixed problem set' })).toBeInTheDocument();
    expect(screen.getByText(/Nothing is waiting/)).toBeInTheDocument();
  });

  it('shows a run that is going under Today', async () => {
    await createRun('interleaving', createPlan(1, TeacherSettingsSchema.parse({})), 1);
    renderAt('/', <HomePage />);
    expect(screen.getByText('Studying the paintings')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.getByText('Going')).toBeInTheDocument();
  });
});

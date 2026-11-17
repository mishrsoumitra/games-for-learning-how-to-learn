import { useState } from 'react';
import { setTheme } from '../../app/theme.ts';
import { FilePicker } from '../../components/FilePicker.tsx';
import { ConfirmDialog } from '../../components/Modal.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { buildBundle, importBundle, parseBundle } from '../../data/exportImport.ts';
import { clearAllData, settings, useSettings } from '../../data/repo.ts';
import { TeacherSettingsSchema, type TeacherSettings, type Theme } from '../../data/schemas.ts';
import { downloadText, fileName } from '../../lib/download.ts';
import { shortCode } from '../../lib/ids.ts';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Same as device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const TEACHER_FIELDS: {
  key: keyof TeacherSettings;
  label: string;
  help: string;
  min: number;
  max: number;
  step: number;
}[] = [
  {
    key: 'secondsPerPainting',
    label: 'Seconds per painting',
    help: 'Research used 3.',
    min: 1,
    max: 6,
    step: 0.5,
  },
  {
    key: 'artistCount',
    label: 'Number of painters',
    help: 'Research used 12. Must be even.',
    min: 4,
    max: 12,
    step: 2,
  },
  {
    key: 'fillerSeconds',
    label: 'Break before the painting test, in seconds',
    help: 'Research used 45.',
    min: 5,
    max: 90,
    step: 5,
  },
  {
    key: 'secondsPerPair',
    label: 'Seconds per word pair',
    help: 'Research used 5.',
    min: 2,
    max: 10,
    step: 1,
  },
  {
    key: 'retrievalDelayDays',
    label: 'Days before the reread-or-recall test',
    help: 'Research shows the effect from 1 day; 2 is the default, 7 is the classic.',
    min: 1,
    max: 14,
    step: 1,
  },
  {
    key: 'spacingTestDay',
    label: 'Test day for cram-or-space',
    help: 'Day 5 by default; day 7 is also fine.',
    min: 4,
    max: 10,
    step: 1,
  },
  {
    key: 'problemsGapDays',
    label: 'Days between problem-set sessions',
    help: 'Research used 7. Use 2 or 3 for a short course.',
    min: 1,
    max: 14,
    step: 1,
  },
];

interface NumberFieldProps {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onCommit: (n: number) => void;
}

/**
 * A number box that keeps what the teacher is typing, and only saves a value that is inside
 * the allowed range. A controlled box would snap back on every half-typed number.
 */
function NumberField({ id, min, max, step, value, onCommit }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));
  return (
    <input
      id={id}
      className="input"
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== '' && Number.isFinite(n) && n >= min && n <= max) onCommit(n);
      }}
    />
  );
}

export default function SettingsPage() {
  const current = useSettings();
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState(0);

  async function doImport(mode: 'merge' | 'replace') {
    if (!pendingImport) return;
    const parsed = parseBundle(pendingImport);
    setPendingImport(null);
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }
    const summary = await importBundle(parsed.value, mode);
    setMessage(
      `Imported ${summary.decks} decks, ${summary.cards} cards, ${summary.mnemonics} mnemonics and ${summary.runs} runs.`,
    );
  }

  return (
    <div className="narrow stack-lg">
      <PageHead
        kicker="Settings"
        title="Settings"
        lead="Your theme, your class code, a backup of everything, and the teacher's knobs."
      />

      {message !== '' && (
        <p className="notice" role="status">
          {message}
        </p>
      )}

      <section className="card stack">
        <h3>Look</h3>
        <div className="theme-toggle" role="group" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={current.theme === t.value}
              onClick={() => setTheme(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h3>Your code for the class plot</h3>
        <p>
          When you save a result file, it carries this code and nothing else about you. Your teacher
          sees a dot with this code on the class plot. Write it down so you can find your dot.
        </p>
        <div className="row">
          <span className="big-number" style={{ fontSize: 36 }}>
            {current.participantCode}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => {
              void settings.update({ participantCode: shortCode() });
            }}
          >
            Give me a new code
          </button>
        </div>
        <div className="field">
          <label htmlFor="display-name">Name shown on your own result pages (optional)</label>
          <input
            id="display-name"
            className="input"
            maxLength={40}
            value={current.displayName}
            onChange={(e) => {
              void settings.update({ displayName: e.target.value });
            }}
          />
          <span className="help">
            The name never leaves this device and is not in result files.
          </span>
        </div>
      </section>

      <section className="card stack">
        <h3>Backup</h3>
        <p>
          Everything the app knows is on this device. Save a backup before changing phone or
          clearing the browser. The file is plain JSON and only this app can read it back in.
        </p>
        <div className="btn-group">
          <button
            type="button"
            className="btn"
            onClick={() =>
              downloadText(
                fileName('study-lab-backup', 'json'),
                JSON.stringify(buildBundle(), null, 2),
              )
            }
          >
            Save a backup file
          </button>
          <FilePicker
            label="Load a backup file"
            onText={(texts) => {
              const text = texts[0];
              if (text !== undefined) setPendingImport(text);
            }}
          />
        </div>
        {pendingImport !== null && (
          <div className="notice stack">
            <p>How should the backup be loaded?</p>
            <div className="btn-group">
              <button type="button" className="btn" onClick={() => void doImport('merge')}>
                Add to what is here (newer copy wins)
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void doImport('replace')}
              >
                Replace everything with the backup
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPendingImport(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card stack">
        <details>
          <summary>
            <strong>Teacher settings</strong>
          </summary>
          <div className="stack" style={{ marginTop: 14 }}>
            <p className="small muted">
              The defaults are the values from the published studies. Change them for a class demo,
              and change them back before students use the app for real.
            </p>
            <label className="check">
              <input
                type="checkbox"
                checked={current.teacher.allowEarlyTests}
                onChange={(e) => {
                  void settings.updateTeacher({ allowEarlyTests: e.target.checked });
                }}
              />
              <span>
                Allow tests and sessions before their day. For demonstrations only: a test taken
                early does not measure what the activity is about.
              </span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={current.teacher.forgettingCurve}
                onChange={(e) => {
                  void settings.updateTeacher({ forgettingCurve: e.target.checked });
                }}
              />
              <span>
                Include the forgetting curve in Cram or space (adds checks on days 4 and 7).
              </span>
            </label>
            {TEACHER_FIELDS.map((f) => (
              <div className="field" key={f.key}>
                <label htmlFor={`teacher-${f.key}`}>{f.label}</label>
                <NumberField
                  key={`${f.key}-${resetCount}`}
                  id={`teacher-${f.key}`}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={Number(current.teacher[f.key])}
                  onCommit={(n) => {
                    const parsed = TeacherSettingsSchema.safeParse({
                      ...current.teacher,
                      [f.key]: n,
                    });
                    if (parsed.success) void settings.updateTeacher(parsed.data);
                  }}
                />
                <span className="help">{f.help}</span>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setResetCount((n) => n + 1);
                void settings.updateTeacher(TeacherSettingsSchema.parse({}));
              }}
            >
              Back to the research defaults
            </button>
          </div>
        </details>
      </section>

      <section className="card stack">
        <h3>Delete everything</h3>
        <p>
          Removes every deck, card, mnemonic and run from this device. Save a backup first if there
          is any chance you will want it.
        </p>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          Delete all my data
        </button>
        <ConfirmDialog
          open={confirmDelete}
          title="Delete everything?"
          body={
            <p>
              This cannot be undone. Your runs, decks and mnemonics will be gone from this device.
            </p>
          }
          confirmLabel="Yes, delete it all"
          danger
          onConfirm={() => {
            setConfirmDelete(false);
            void clearAllData().then(() => setMessage('Everything has been deleted.'));
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      </section>

      <section className="card stack">
        <h3>About your data</h3>
        <p>
          Study Lab keeps everything in your browser's own storage (IndexedDB). It makes no network
          requests after it has loaded, and the page is locked down with a Content Security Policy
          so no outside script can run in it. The only way data leaves is a file you choose to save.
        </p>
      </section>
    </div>
  );
}

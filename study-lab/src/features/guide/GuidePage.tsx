import { PageHead } from '../../components/PageHead.tsx';
import { SOURCES } from '../../content/research.ts';

/** How each activity was built, what the papers did, what was changed, and the caveats. */
export default function GuidePage() {
  return (
    <div className="narrow stack-lg">
      <PageHead
        kicker="Guide"
        title="How the activities were built"
        lead="Each activity copies a published experiment as closely as a browser allows. This page says what the paper did, what is different here, and where the evidence is weaker than it sounds."
      />

      <section className="card stack">
        <h2>The idea underneath all four</h2>
        <p>
          In every one of these studies, students were asked two things: how well do you think you
          learned, and how much can you actually recall? The two answers disagree, and they disagree
          in the same direction every time. The way that feels smoother while you study (rereading,
          one topic at a time, one long sitting) leaves less behind. The way that feels like a
          struggle (recalling, mixing, spreading over days) leaves more.
        </p>
        <p>
          Kirk-Johnson, Galla and Fraundorf (2019) measured why. Students read the effort as a sign
          of poor learning, and then chose the easier way. Deslauriers and colleagues (2019) found
          the same thing in Harvard physics lectures: the class that learned more said it had
          learned less. Being told this helps a little. Seeing it on your own numbers, with your
          prediction next to your score, helps more (Tullis, Finley and Benjamin, 2013; Yan, Bjork
          and Bjork, 2016). That is what this app is for.
        </p>
      </section>

      <section className="card stack">
        <h2>Mixed or blocked</h2>
        <h4>The paper</h4>
        <p>
          Kornell and Bjork (2008), replicated by Yan, Bjork and Bjork (2016). Twelve landscape
          painters, six paintings each, three seconds a painting, names shown. Half the painters
          blocked, half interleaved, 45 seconds of Tetris, then new paintings to classify. Mixed
          63%, blocked 42% (Yan, Experiment 1A). 78% of students did better mixed, and 78% rated
          blocked as good or better.
        </p>
        <h4>What is different here</h4>
        <ul>
          <li>
            The painters are made up, each one a recipe of shape, palette, layout and fill, because
            real paintings cannot be shipped in an app. The recipes share features in pairs so the
            painters are confusable, which is the condition under which interleaving helps most
            (Brunmair and Richter, 2019).
          </li>
          <li>
            The two schedules are two separate phases with two frame colours, instead of being woven
            together as in the original, because Yan and colleagues found (Experiment 6) that
            students only believed the result when the conditions were easy to tell apart.
          </li>
          <li>The Tetris break is a tap-the-bigger-number game.</li>
        </ul>
        <h4>Caveats</h4>
        <p>
          Interleaving helps when the categories are similar and easy to confuse. It does nothing
          for unrelated lists of words, and in maths the average effect is smaller (g = 0.34) and
          varies a lot between studies. Expect roughly one student in five not to show the effect on
          a single run.
        </p>
      </section>

      <section className="card stack">
        <h2>Reread or recall</h2>
        <h4>The papers</h4>
        <p>
          Karpicke and Roediger (2008): 40 Swahili–English pairs, study-and-test cycles, test one
          week later. Pairs kept in testing were recalled at about 80%; pairs dropped from testing
          at 33 to 36%. Every group predicted about 50%. Roediger and Karpicke (2006), Experiment 2,
          prose passages: after five minutes, studying four times beat studying once and recalling
          three times (83% to 71%); after a week the order flipped (40% to 61%). Rowland's 2014
          meta-analysis of 61 studies: g = 0.41 for tests within a day, g = 0.69 after a day.
        </p>
        <h4>What is different here</h4>
        <ul>
          <li>
            Every student studies all 40 pairs once, then half are reread three times and half are
            recalled three times with the answer shown after each try. The original varied this
            between groups and gave no feedback.
          </li>
          <li>
            The delayed test is two days later by default, not a week, so it fits a timetable. The
            effect is reliable from one day.
          </li>
          <li>
            The optional five-minute test uses eight extra pairs, so the main forty are not tested
            early. An early test is itself a kind of practice.
          </li>
          <li>Typed answers are marked leniently on spelling and strictly on meaning.</li>
        </ul>
        <h4>Caveats</h4>
        <p>
          For a brand-new multi-step method (a proof technique, an algorithm), studying worked
          examples beats unsupported problem attempts (Yeo and Fazio, 2019). Testing yourself is for
          facts, definitions, formulas and choosing the right method, and for redoing solved
          problems from memory. A widely quoted claim that retrieval beats concept mapping (Karpicke
          and Blunt, 2011) was challenged in 2023 as an artefact of unequal study time.
        </p>
      </section>

      <section className="card stack">
        <h2>Cram or space</h2>
        <h4>The papers</h4>
        <p>
          Kornell (2009): GRE vocabulary flashcards, one big stack studied across days against four
          small stacks crammed. Spacing won for 90% of students; after the first session 72%
          believed cramming had worked better. Cepeda and colleagues (2008): for a test one week
          away, the best gap between study sessions is about 20 to 40% of the delay, that is one to
          three days.
        </p>
        <h4>What is different here</h4>
        <ul>
          <li>
            Two matched sets of 20 words. The spaced set gets one pass on days 0, 1, 2 and 3; the
            crammed set gets four passes on day 3. A pass is cue, type, answer shown.
          </li>
          <li>The test is on day 5 by default.</li>
          <li>
            The forgetting curve is this app's own addition, built from the research notes: a third
            set learned on day 0 and tested in fifths at 10 minutes and on days 1, 2, 4 and 7. Four
            words per point, so it is rough.
          </li>
          <li>
            If a session is late, the rest of the plan moves by the same number of days and the run
            is marked off schedule.
          </li>
        </ul>
      </section>

      <section className="card stack">
        <h2>Mixed problem set</h2>
        <h4>The papers</h4>
        <p>
          Rohrer and Taylor (2007): volumes of four unusual solids, practice blocked or mixed across
          two sessions a week apart, test a week after that. Mixed 63%, blocked 20%, and mixing made
          practice worse. Rohrer, Dedrick, Hartwig and Cheung (2020): a trial with 787 school
          students over four months, test a month later, 61% against 38%.
        </p>
        <h4>What is different here</h4>
        <ul>
          <li>
            Each student gets both conditions: two solids blocked and two mixed, chosen by the seed.
          </li>
          <li>
            The formulas are standard mensuration results and are stated on screen in the tutorial;
            the paper's exact wording was not available when this was built.
          </li>
          <li>Answers within one percent count as right, so rounding does not decide the score.</li>
        </ul>
        <h4>Caveats</h4>
        <p>
          Engineering students may find these problems easy, which squashes the difference. Only
          four test problems per condition, so one problem is 25 points. The gap between sessions
          can be shortened in Settings for a short course.
        </p>
      </section>

      <section className="card stack">
        <h2>Flashcards and mnemonics</h2>
        <p>
          The flashcard review is retrieval practice with spacing built in: you type the answer
          before you see it, and the gap before a card returns grows each time you remember it. The
          scheduler is in the family of SM-2, the one most flashcard apps use.
        </p>
        <p>
          Mnemonics are hooks, not understanding. They are for the things that will not stay put
          (orders, lists, constants, foreign words), and they only keep working if you pull on them,
          which is what the quiz is for. Hartwig and Dunlosky (2012) found that most students who
          self-test do it to check what they know, not to learn. Do it to learn.
        </p>
      </section>

      <section className="card stack">
        <h2>Your data</h2>
        <p>
          Everything stays in your browser. The app makes no network requests after it loads, runs
          under a strict Content Security Policy, and only writes a file when you press a button
          that says so. Result files carry a random code and your scores, nothing else. The teacher
          builds the class plot on their own computer from the files students send.
        </p>
      </section>

      <section className="card stack">
        <h2>Sources</h2>
        <ol>
          {SOURCES.map((s) => (
            <li key={s.id}>
              {s.citation}
              {s.url && (
                <>
                  {' '}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    (link)
                  </a>
                </>
              )}
            </li>
          ))}
        </ol>
        <p className="small muted">
          Figures were taken from the research notes this app was built from, in October 2026. Where
          a paper could not be opened directly, the notes say so, and this guide repeats the figures
          as given there.
        </p>
      </section>
    </div>
  );
}

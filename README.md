# Games for Learning How to Learn

Self-contained HTML games for the *Learning How to Learn* course at Newton School of Technology. Each game is one file with its fonts embedded, so it runs offline, can be sent as an attachment or hosted anywhere, and stores results only on the student's device (local storage, with CSV and JSON export).

| File | Lecture | What the student measures |
|---|---|---|
| `replicated-experiments-lab.html` (~300 KB) | Any lecture on memory or attention; homework | Fourteen experiments that held up in the large replication projects, each as a short game on the student: false memory, serial position, spacing in a list, generation, production, self-reference, flanker, Simon, visual search, attentional blink, repetition priming, semantic priming, illusory truth, and confidence against recall. The student's own data is drawn next to the published data. |
| `derivation-lab.html` (~165 KB) | Lecture 6 · Chunking (no slide mapped yet) | How many symbols of a few lines of algebra the student puts back after a five-second look, when the lines are a Class 11 derivation and when the same symbols are in an order picked by chance. It is the chess experiment of Chase and Simon (1973) done with derivations. |
| `how-the-mind-learns-lab.html` (~420 KB) | Lecture 12 · How Our Mind Learns (the book's ten principles); Lecture 6 · Chunking | Forty-two small experiments from all ten chapters of Willingham's *Why Don't Students Like School?*, done on the student. Thirty were added on 22 November 2026 after the whole book was read. The first twelve: the candle problem, three rings and the tea ceremony, letters with and without chunks, a paragraph without a title, cricket against baseball, the four-card task, two word lists, everyday things, hints that match or don't, the general and the doctor, a sentence written in numbers, and pictures with words on them. At how many stations the book's finding showed up in the student's own result. |
| `expert-novice-lab.html` (~220 KB) | Lecture 6 · Chunking (no slide mapped yet) | How the student's own knowledge is arranged: whether they sort 24 physics problems by the objects in them or by the principle that solves them (Chi, Feltovich and Glaser, 1981), and how many pieces of a chess position they put back after five seconds, in what order and in what bursts (Chase and Simon, 1973). |
| `thinking-fast-and-slow-lab.html` (~310 KB) | Lecture 5 · slide 9, System 2 and the very small room; homework for any lecture that names the two systems | Fourteen of the small experiments from Kahneman's *Thinking, Fast and Slow*, done on the student's own head: the face and the sum, the two lines, colour words, the bat and the ball, priming, mere exposure, Alan and Ben, the anchoring wheel, what kills more people, Linda, praise and scold, ninety-percent ranges, sure thing or gamble, the two noises. At how many stations System 1 got its way, and a System 2 score for the stations with a right answer. |
| `disturbance-lab.html` (~225 KB) | Lecture 5 · slide 7, Remember Seven Digits While I Ruin It | The same seven-digit recall under four kinds of sound: silence, loud steady noise, a quiet voice reading numbers, and the student's own voice kept busy. What each sound costs, and whether a digit the voice said reaches the page. |
| `working-memory-lab.html` (~285 KB) | Lecture 5 · The Desk and the Library | How many things working memory holds, what happens when it also has to work, how far known chunks stretch it, how fast it empties, and what repetition builds. |
| `attention-lab.html` (~250 KB) | Lecture 4 · Attention (also Lecture 5, activities 1 and 2) | Attention span four ways: focus stretches, lapses, reaction steadiness, timing jitter. |

All text in the games follows the plain teacher's voice used in the lecture decks: short sentences, ordinary words, questions before answers, and instructions that tell the student to do something. Every research claim in the games and in this file was checked against the primary paper in September 2026. Where a paper could not be opened, the claim says so.

## Study Lab (`study-lab/`)

Built on 25 October 2026. A React application, not a single file: four research-based activities that measure the same thing two ways (how well the student *feels* they learned, and what they can actually recall), plus flashcards with spaced review and a mnemonic builder with a self-quiz. Hosted at `/study-lab/` on the same Vercel site; `deploy.sh` builds it and copies `study-lab/dist` into `site/study-lab/`.

| Activity | Lecture | What the student does | Based on |
|---|---|---|---|
| Mixed or blocked | Lecture 6 · Chunking | Learns twelve made-up painters (six paintings each, 3 s each); half the painters one at a time, half mixed, as two separate phases with two frame colours. Predicts, takes a 45 s break, names 24 new paintings. One sitting, about 15 minutes. | Kornell and Bjork (2008); Yan, Bjork and Bjork (2016), Exp. 1A (63% vs 42%) and Exp. 6 (separate phases needed for belief change) |
| Reread or recall | Lecture 7 · Retrieval | Studies 40 Swahili–English pairs once; 20 are reread three times, 20 are recalled three times with the answer shown. Predicts per condition. Optional five-minute test on 8 extra pairs. Comes back after 2 days (teacher can set 1–14) for the typed test on all 40, then an honesty question. | Karpicke and Roediger (2008); Roediger and Karpicke (2006), the 5-minute reversal; Rowland (2014) |
| Cram or space | Lecture 8 · Spacing | Two sets of 20 pairs: one gets one pass on days 0, 1, 2, 3; the other four passes in a row on day 3. Ratings after every session, predictions before the day-5 test. Optional forgetting curve: a third set tested in fifths at 10 min and days 1, 2, 4, 7. Late sessions shift the plan and flag the run. | Kornell (2009), 90% / 72%; Cepeda and others (2008) |
| Mixed problem set | Lecture 6 · a Maths version | Tutorial on four solids (wedge, spheroid, spherical cone, half cone), 16 practice problems with two solids blocked and two mixed, predictions, a second session, then a test of 8 new problems a week later. Practice-versus-test crossover shown. | Rohrer and Taylor (2007), 63% vs 20%; Rohrer, Dedrick, Hartwig and Cheung (2020) |

Every run stores a seed, so its plan can be rebuilt. Items are assigned to conditions at random per student and the result sheet says so, to head off the "those were easier items" explanation. Each result sheet shows prediction next to score per condition, the published numbers, the reason, and a one-in-five warning about single-run noise. Students can save a result file (random code plus scores, nothing else); the teacher loads all of them on the Results → class page to see the class on the felt-versus-worked plot. Runs where the student said they looked at the words in between are left out of the class plot.

Stack and checks: Vite 8, React 19, TypeScript 6 (strict, `noUncheckedIndexedAccess`), React Router 8, Zod 4 for every stored or imported record, `idb` for IndexedDB. No other runtime dependency. Fonts are self-hosted; the app makes no network requests after it loads. A strict Content Security Policy (`script-src 'self'`, `style-src 'self'`, no inline) is in both a meta tag and `site/vercel.json`, with `X-Frame-Options`, `Permissions-Policy`, COOP/CORP and HSTS headers. Imported files are size-limited and schema-checked; CSV exports escape formula-leading cells. Lint is oxlint with the React, a11y, import, promise and vitest plugins; Prettier checks formatting; Vitest runs 65 unit and component tests (engines, scheduler, data layer, pages); Playwright runs end-to-end tests in the installed Chrome against the production build. `npm audit` reports zero vulnerabilities on exact-pinned versions and runs in CI weekly. A build-time service worker precaches the app for offline use. Commands, from `study-lab/`: `npm ci`, `npm run check` (typecheck, lint, format, tests, audit, build), `npm run test:e2e`, `npm run dev`.

Not yet done: the research audit of this app (the numbers come from the October 2026 research notes, not from reopened papers); a STEM variant of the painting task (which sorting algorithm produced this trace); using a student's own deck in Cram or space.

## Files in this folder and hosting

- The seven `*-lab.html` files at the top level are the games. Each one works on its own: open it in a browser, or send it to students as an attachment.
- `site/` is the version hosted on Vercel: the same seven files plus `index.html`, a landing page that links to them.
- `deploy.sh` copies the seven games into `site/`, builds Study Lab into `site/study-lab/`, and deploys `site/` to Vercel (first time only: `npx vercel login`). Run it after changing any game so the hosted copy matches. `site/vercel.json` holds the security headers and the single-page rewrite for `/study-lab/`.
- `research-audit-2026-09-13/` holds the research audit reports for the Attention, Disturbance and Working Memory labs.

## What changed on 13 September 2026

- New: `thinking-fast-and-slow-lab.html`, fourteen stations from Kahneman's book in the order of its five parts, with a System 1 / System 2 result sheet, Projector mode, and a guide that says which of the book's claims survived replication and which did not.
- Every heading, button, verdict and reading in the three games was rewritten in the plain voice. Instrument names now say what the student does ("Count the seconds", "Press for every digit except 3", "Digit span", "Coloured squares").
- The Working Memory Lab's Repeat instrument was unreachable (its view was missing from the navigation list). Fixed.
- Research audit, Disturbance Lab: digits are now shown one at a time by default, as in every study of the effect; each list uses distinct digits; a wrong digit counts as "from the voice" only if the voice said it in the two seconds before the keystroke; the talking round defaults to the research task ("the, the, the" at two a second) with the times table kept for class; the verdict threshold drops to half a digit when three lists are run. The citation for the talking round was wrong (Baddeley, Lewis and Vallar, 1984, is about spoken lists) and is now Chincotta and Underwood (1997). The "one to three digits lost" claim was about double what the research shows and is now "half a digit to one digit".
- Research audit, Attention Lab: the PVT wait is now measured from the previous response with the feedback included, as in Basner's protocol, and the unvalidated 5-minute option is gone; the PVT score uses response speed (mean 1/RT) instead of median reaction time, which is the least sensitive measure; SART bands were re-cut so that the healthy-adult mean (about 25%) sits inside "typical" rather than on the edge of "sharp"; rhythm bands were widened to fit the only published variability figures; the fourth probe option is "My mind was blank" (Jackson and Balota, 2012) instead of "Not sure"; the browser-timing numbers were wrong (the paper says about 80 ms delay, not 8 to 67) and are corrected; the "30 to 40% of lecture probes, rising to half" claim had no source and is replaced.
- Research audit, Working Memory Lab: digit-span bands now treat 6 to 8 forward as typical (7 is the adult mean, not "above average"); the coloured-squares run has 24 trials per set size instead of 16; the Brown–Peterson round holds three consonants by default and counts to a one-second beat, as in the original, with four digits kept as the slide's version and four trials per delay; the Hebb attributions were untangled (span + 1 is Norris, Page and Hall, 2018; every third trial is Hebb; eight repetitions among twenty fillers is Page and Norris, 2009); Bower and Springston's example was misquoted and is fixed; "noticing helps a little" had no source and is replaced.
- Score bands are now described as the lab's own, anchored to published norms where norms exist (digit span, K, SART error rates, PVT lapse counts) and chosen by hand where they do not.
- The three audit reports (every citation with how it was opened, a claim-by-claim table, and a design audit per instrument) are in `research-audit-2026-09-13/`. Read them before changing any number in the games.

## Replicated Experiments Lab

One file, `replicated-experiments-lab.html`, added on 23 November 2026. Soumitra asked for a survey of the most replicated experiments in the research literature and a game for each one that held up, so that students feel the result in their own data. The lab has fourteen stations in three parts, about an hour in all. It was built on the engine of the How the Mind Learns Lab.

### How the fourteen were chosen

The large replication projects were read first: the Open Science Collaboration (2015), Many Labs 1, 2 and 3, Zwaan and others (2018) and Crump, McDonnell and Gureckis (2013). The pattern is the same in all of them. Experiments where each person does many trials of both conditions, without knowing what is being looked for, give the same result almost every time (all nine in Zwaan, run twice online). Experiments that ask two groups one question each often don't. So the rule was: many trials, both conditions on the same student, purpose not obvious, runs in a browser in a few minutes, and not already in another lab.

### What the student does

| Station | Part | Experiment | What the student does | What the page compares |
|---|---|---|---|---|
| Four lists of twelve words | 1 | False memory, Roediger and McDermott (1995) | Four lists of twelve related words, recall after each, then a yes-or-no test of 24 words. | "I saw it" for shown words, the four missing words, and other new words. |
| First words, middle words, last words | 1 | Serial position, Murdock (1962) | Four lists of fifteen words, typed back at once. | Recall by place in the list, as a line. |
| Twice in a row, or twice with a gap | 1 | Spacing, Greene (1989) | One list where eight words repeat back to back and eight repeat with four or more words between. | Recall of the two kinds. |
| Read it, or finish it yourself | 1 | Generation, Slamecka and Graf (1978) | 24 word pairs, half printed, half with letters missing to type. | Recall of read and finished words. |
| Say it aloud, or read it silently | 1 | Production, MacLeod and others (2010) | 32 words, the red ones said aloud. Then a 48-word recognition test. | Recognition of aloud and silent words. |
| Is this word about you? | 1 | Self-reference, Rogers, Kuiper and Kirker (1977) | 30 adjectives, each with one of three yes-or-no questions. Surprise recall. | Recall by question: letters, meaning, about you. |
| The middle arrow | 2 | Flanker, Eriksen and Eriksen (1974) | 64 rows of five arrows. | Time when the side arrows agree and disagree. |
| Blue is left, orange is right | 2 | Simon effect | 72 discs on the left or right. | Time when the disc is on the side of its button and on the other side. |
| Find the orange T | 2 | Visual search, Treisman and Gelade (1980) | 60 boxes of 4, 12 or 24 letters. | Milliseconds for each extra letter, in a one-colour crowd and a mixed crowd. |
| Two numbers in a stream of letters | 2 | Attentional blink, Raymond, Shapiro and Arnell (1992) | 40 streams at ten items a second. | Second number caught, by how soon it followed the first, as a line. |
| Is it a word? | 3 | Repetition priming | 80 strings, each shown twice. | Time for a rare word the first and the second time. |
| A word after its friend | 3 | Semantic priming, Meyer and Schvaneveldt (1971) | 60 pairs: read the first word, judge the second. | Time after a related and an unrelated word. |
| True or false? | 3 | Illusory truth, Hasher, Goldstein and Toppino (1977) | Rates 16 statements for interest, then 32 for truth. | Truth rating for statements read before and for new ones. The card then says which are true. |
| How sure are you that you will remember? | 3 | Koriat and Bjork (2005) | Studies 20 pairs, predicts recall for each, takes the test. | Expected and recalled, for pairs that run forward and backward. |

### What the student gets back

After each station a card draws the student's result in red next to the published result in grey, says what happened in one line, names the experiment, and ends with what it means for studying. The fast stations show a running count and the longest run without a mistake. The result sheet counts the stations where the published result showed up in the student's own data. It does not rank the size of an effect: Hedge, Powell and Sumner (2018) show that these tasks are reliable for groups and not for comparing one person with another, and the guide says so.

### The research behind it (opened 23 November 2026)

- Read in full: Roediger and McDermott (1995), Stadler and others (1999), Zwaan and others (2018) with its supplement, Crump and others (2013), MacLeod and others (2010), Treisman and Gelade (1980), Meyer and Schvaneveldt (1971), Koriat and Bjork (2005), Bertsch and others (2007), the Open Science Collaboration (2015), Many Labs 1.
- Read in full, numbers taken by eye from a graph: Slamecka and Graf (1978), Eriksen and Eriksen (1974), Raymond and others (1992).
- Summary or poor copy only: Rogers, Kuiper and Kirker (1977), Hedge and others (2018), Cepeda and others (2006), Dechêne and others (2010), Many Labs 3 (results table).
- Not opened, so the card gives a later repeat of the experiment: Murdock (1962), Greene (1989), Simon (1969), Scarborough and others (1977), Hasher and others (1977).
- The 32 statements at "True or false?" were checked one by one. Three were reworded after the check.

### What to tell students about the limits

- One person in one short run can go the other way at any station. Semantic priming is the weakest for one person.
- The grey numbers come from other people tested in another way, often with more trials. They show the direction and rough size.
- The production station trusts the student to speak. It asks at the end.
- The attentional blink here uses two numbers among letters. The grey line is from the white-letter version.
- Illusory truth is shown after a few minutes. The original used two weeks.

### How it is built

- Assembled from `how-the-mind-learns-lab.html`: same head, styles, engine, results and export. The stations script, the guide and the home text are new. Results are stored under their own key.
- New pieces: `press()` for fast trials with keys and big buttons, `rtBlock()` for a run of them with a score line, `youVs()` for red and grey bars, `lineChart()` for the two curves, an animation-frame loop for the letter stream.
- Tested 23 November 2026 in headless Chrome: a bot played all fourteen stations through the real buttons with no console errors, a result sheet with sample data was looked at, and five game cards were looked at on phone width.

### Not built, and why

- Failed in large replications: ego depletion, money and flag priming, the "more words start with K" question (Many Labs 3: 0.09 against 0.82), power posing, incidental anchoring. **The K question is still in the Thinking, Fast and Slow Lab at "What kills more people" and should be removed or given this caveat.**
- Work only with a whole class: anchoring, framing, gambler's fallacy, false consensus.
- Need a return visit: the testing effect (in Study Lab).

### Activities to add next

- Mental rotation, Fitts's law, Sternberg's memory scanning and the flicker form of change blindness. They are thought to be very reliable, and no replication source has been opened for them yet.
- A class page that pools exported files, so that anchoring and the other whole-class effects can be shown.
- Open Murdock (1962), Greene (1989) and Hasher and others (1977) in full.

## Derivation Lab

One file, `derivation-lab.html`, added on 17 November 2026. It is the chess experiment of the Expert and Novice Lab done with derivations: the student looks at a few lines of algebra for five seconds and then puts the symbols back. It fits Lecture 6 (Chunking). No slide is mapped to it yet.

### What the student does

1. Presses Show the lines. Four or five lines of algebra stay on the screen for 5 seconds (10 seconds is a setting) and are then cleared.
2. Puts the symbols back line by line by tapping keys: the letters of that set, 2, ½, the small raised 2, =, +, −, / and the brackets, with Delete and Next line. On a laptop the student can type.
3. Presses Done and sees their lines next to the lines that were shown, with every symbol marked right, wrong or missed.
4. Does this four times (two is a setting). Two sets are derivations as they are. The other two are the symbols of a derivation in an order picked by chance. The two kinds alternate, and which kind comes first is picked by chance.
5. After each real derivation, answers one question: "Before today, could you write this derivation on your own?" (yes, some of it, no).

The home page asks the student to do the experiment before opening the Guide, because the Guide gives away what the experiment looks for.

### What the student gets back

- Symbols put back out of every 100, for the derivations and for the chance-order sets, next to each other.
- A reading in plain words that depends on the gap between the two, and a line that compares the derivations the student said they could write with the ones they said they couldn't.
- The published numbers for Class 9 students (Geary and others, 2015) in a small table, with a note on why to compare loosely.
- Set by set: the student's lines next to the lines shown, and for each real derivation the four or five steps that somebody who knows it holds in place of 40 symbols.
- Every run is kept on the device, with CSV export (one row per set) and JSON export (with the time of every key press). A run that is stopped half way is not saved.

### How it is built

- Four derivations from Class 11 physics, written out for this lab: the third equation of motion from v = u + at (47 symbols, 4 lines), the second equation of motion from the average velocity (41 symbols, 4 lines), work and kinetic energy (40 symbols, 5 lines), kinetic energy from momentum (32 symbols, 5 lines). A symbol is one letter, one digit, ½, the raised 2, one sign or one bracket.
- A chance-order set takes every symbol of one derivation, shuffles them, and cuts them into lines of the same lengths. So it has the same symbols and the same number of lines. This follows Chase and Simon's random positions (the same pieces on squares picked by chance). In one run no derivation is used twice.
- Marking is the lab's own. Each of the student's lines is lined up with a shown line (longest common subsequence), so a symbol missed in the middle does not spoil the rest of the line. Lines are matched in order, so a line that is left out does not spoil the lines after it. A line counts right symbols minus wrong symbols, never less than 0.
- Why wrong symbols cancel: in a simulation of 3,000 runs per derivation, filling every line with symbols in a random order got 8 to 12 symbols "right" out of 32 to 47 by alignment alone. With the cancel rule the same filling is counted as 1 to 3 symbols.
- The lines are shown and typed with the same symbol-by-symbol layout in both kinds of set, so a derivation and a chance-order set look the same on the screen except for the order.
- Tested 17 November 2026 in headless Chrome with a bot that plays through the real keys and buttons (a student who knows the derivations, and one who puts back only a few symbols), plus editing in the middle of a line, typing, stopping half way and the export, at laptop and phone width, with no console errors.

### The research behind it (opened 17 November 2026)

- **Sweller and Cooper (1985)**, *Cognition and Instruction* 2(1), 59–89. Full text read (scan). Experiment 1: 22 Year 9 students, 22 Year 11 students and 18 university students in Maths teacher education, in Sydney. Each line of algebra was on a screen for 5 seconds, then 30 seconds to write it. Four real equations and four random symbol strings in a set. The score was the longest continuous correct string. First test, Table 1: equations 7.9, 10.3, 10.9; random strings 4.4, 4.5, 4.4. Year 9 against the rest was significant for equations, and nothing between groups was significant for random strings. Year 11 and university did not differ. The paper models the task on de Groot (1966), not on Chase and Simon.
- **Geary, Hoard, Nugent and Rouder (2015)**, *Journal of Experimental Child Psychology* 140, 211–227. Author manuscript read up to the results. 171 US ninth graders, 5 seconds, 30 seconds to write, longest continuous correct string as a percentage. Valid equations 55 (19 symbols) and 44 (15 symbols); invalid 22 and 28. One grade only, so there is no expert and novice comparison in it.
- **Ranney (1987)**, *Memory & Cognition* 15(1), 29–41. Full text read. With about 110 ms on screen and a forced choice of one character, algebraic strings were no better than scrambled ones (74.0% against 73.7%, Experiment 1).
- **Egan and Schwartz (1979)**, *Memory & Cognition* 7(2), 149–158. Full text read. Experiment 2: six electronics technicians against six novices, 5 or 10 seconds, real circuit drawings and drawings with the symbols at random places. Technicians were better on real drawings and not on random ones. Group means are only in a figure, so the lab quotes none. The authors say they can't rule out guessing.
- **Chase and Simon (1973)** was read in full on 15 November 2026 for the Expert and Novice Lab. The numbers used here are the ones listed in that section.
- **Not opened:** McKeithen, Reitman, Rueter and Hirtle (1981) on recall of real and scrambled programs, and Bernard (1983) on recall of equations after 1.5 seconds. The lab does not mention either.

### What to tell students about the limits

- The published experiments used single equations. Nobody we could find has done this with a derivation of several lines or with physics formulas. The Guide says this.
- On a derivation a student knows well, they partly work it out again. That is what the experiment is about, but the number is not a measurement of memory.
- Sweller and Cooper scored equations and random strings by different rules and never tested one against the other. Don't say "equations were so many times better" from that paper.
- The lab's count (every right symbol, minus the wrong ones) is not the papers' count (longest unbroken correct run). The table on the result sheet says to compare loosely.
- One run has two sets of each kind, and the four derivations are not equally long. The class's numbers together mean more than one student's.

### Activities to add next

- A Projector mode where the class sees one set of lines and each student puts it back on their own phone.
- A derivation the class has not met yet, done once before the lecture that teaches it and once a week after, so each student sees their own number change.
- A third kind of set where every line is a correct equation but the lines don't follow from each other.
- Reading the pauses between key presses, the way the chess experiment reads bursts.
- A class view that collects the exported files.

## How the Mind Learns Lab

One file, `how-the-mind-learns-lab.html`, added on 16 November 2026 with twelve small experiments from the first five chapters of Daniel Willingham's *Why Don't Students Like School?*, and extended on 22 November 2026 to 42 experiments from all ten chapters (see "What changed on 22 and 23 November 2026" below). The student does each one on themselves. It fits any lecture that uses the working memory and long-term memory picture, and Lecture 6 (Chunking) in particular. No slide is mapped to it yet.

### What the student does

The first twelve stations are in this table. They take two to five minutes each, about thirty-five minutes in all. The thirty newer ones are in the table further down. Any one station can be done alone.

| Station | Chapter | What the student does |
|---|---|---|
| The candle on the wall | 1 | Thinks for up to two minutes about fixing a candle to a wall with matches and a box of drawing pins, then says which idea they had. |
| Three rings and a tea ceremony | 1 | Moves three rings across three pegs, then reads the same puzzle told as a tea ceremony and rates how hard it looks. |
| Twenty letters, twice | 2 | Sees twenty letters for eight seconds and types them. Then again with a row where the spaces fall on IIT, PAN, RBI and so on. |
| A paragraph without a title | 2 | Reads a vague paragraph, rates how well they understood it, then reads it again with its title. |
| Two last overs | 2 | Reads the end of a cricket match and the end of a baseball game, 35 seconds each, and answers four questions on each from memory. |
| Four cards | 2 | Picks which cards to turn over for "vowel means even number", then for "voting means 18 or older". |
| Two questions about words | 3 | Answers "does it have an E?" for twelve words and "is it pleasant?" for twelve others, then gets a surprise recall test. |
| Things you have seen a thousand times | 3 | Six questions about a dial pad, the flag, a logo, a keyboard, the rupee sign and a dice. |
| Eight sentences and eight hints | 3 | Reads eight sentences, does four sums, then gets a hint for each thing. Half the hints match the sentence they read and half are about another side of the thing. |
| A general and a doctor | 4 | Reads the fortress story, then tries the radiation problem, first alone and then with a hint to use the story. |
| A sentence written in numbers | 5 | Reads a sentence where A is 1, B is 2 and so on, in their head, and types it from memory. Then the same with an ordinary sentence shown for four seconds. |
| Name the picture, not the word | 5 | Presses the name of an animal picture that has a word printed on it, 24 times. |

### What the student gets back

- After every station, a card with their own numbers, what happened in the original study, and what the book takes from it for a student.
- A result sheet with one count at the top: at how many stations the thing the book describes showed up in the student's own result. There is no score out of 100 in this lab, because most stations have no right answer.
- A one-line summary per station, history on the device, and CSV and JSON export. A run that is stopped keeps the stations that were finished.

### How it is built

- It reuses the station engine, result sheet, history and export of the Thinking, Fast and Slow Lab. The stations, the home page, the guide and the wording are new. Projector mode is not offered, because most stations need typing.
- Every sentence, word list and paragraph was written for this lab. Nothing is copied from the book. American material is replaced: IPL, GST, ATM, UPI, SBI, JEE and IIT, PAN, RBI, OTP, SIM, USB for the letter rows; cricket against baseball for Recht and Leslie; the voting age for the drinking age.
- Where the original study compared two groups of people, one student does both halves here, in an order picked by chance where the order could matter.
- "It showed up for you" uses cut-offs that are the lab's own: three more letters in the chunked row, a rise of two points with the title, more recalled from the meaning list, and so on. A station that can't say is left out of the count.
- The candle and the doctor's problem can't read the student's idea. They ask the student to say which of several ideas was theirs.
- Tested 16 November 2026 in headless Chrome with a bot that plays all twelve stations through the real buttons, at laptop and phone width, with no console errors.

### The research behind it (opened 16 November 2026)

- **The book.** The lab did not have the whole book. Which demonstration is in which chapter comes from the publisher's excerpt of chapter 1 (2nd ed.), search snippets of the 1st edition, and Willingham's *American Educator* articles (2002 to 2009). The number-code sentence is in chapter 5. The four-card task is in chapter 2.
- **Read in full:** Bransford and Johnson (1972), Experiment II: comprehension 4.50 with the title before, 2.29 with no title, 2.12 with the title after; recall 5.83, 2.82, 2.65 of 18. Recht and Leslie (1988): 64 students, re-enactment 27.5 of 40 for poor readers with high knowledge against 18.8 for good readers with low knowledge. Nickerson and Adams (1979): 15 of 36 picked the right penny from 15 drawings; median 3 of 8 features drawn. Gick and Holyoak (1980), Experiment IV: 3 of 15 without a hint, 11 of 12 with a hint, under 10 percent with no story. Griggs and Cox (1983): 74 percent on the drinking-age version, usually under 10 percent on the abstract version. Kotovsky and Simon (1990): story versions of the Tower of Hanoi took up to 16 times as long. Starreveld and La Heij (2017): picture and word interference of roughly 40 to 70 ms.
- **Not opened:** Hyde and Jenkins (1973) and Barclay and colleagues (1974). The station cards give their findings in words, with no numbers, and say so. The candle-problem figures (about four in ten solve it with the box full) are from a secondary summary of Duncker (1945) and Adamson (1952), and the card says so.

### What to tell students about the limits

- The count on the result sheet is not a mark. The research results are averages over many people, and each station here is one short try.
- A station works only the first time. The second time, the student knows the trick.
- Since 22 November 2026 every chapter has stations. The two experiments of chapter 6 (chess and physics sorting) are still in the Expert and Novice Lab.

### What changed on 22 and 23 November 2026

Soumitra asked that every example in the book be turned into a game, for Lecture 12 (How Our Mind Learns), which goes through the book's ten principles. The whole second edition was read in his Kindle copy, from the Introduction to the Conclusion, and every example was listed with its page: about 45 demonstrations and studies a person can take part in, and about 125 stories and classroom examples. The twelve stations of 16 November were checked against the book, and thirty stations were added. The lab now has 42 stations over all ten chapters and takes about two hours, so the setup page lets the student pick one chapter by tapping its name.

| New station | Chapter | From the book (Kindle page) | What the student does |
|---|---|---|---|
| A question and a sum | 1 | Polar bear (11), 18 × 7 (13) | Answers three easy questions and does 18 × 7 in the head. The page times both. |
| What the writer left out | 2 | Barbecue sentence (30), lake house and tide (31), long *Moby-Dick* sentence (32) | Reads two sentences with a gap and one long sentence with none, and answers one question on each. |
| Two paragraphs with the same shape | 2 | Motor learning and chiffon cake (43–44) | Reads a paragraph on chai and one on motor learning, predicts which will stay, and takes a short test. |
| Two students and 500 new facts a month | 2 | Table 2.1 (45) | Guesses what happens to the gap, then moves a slider through ten years. |
| What stayed and what did not | 3 | The two circles (61–62) | Says, for twelve things, if they come to mind right now. |
| What will the class remember? | 3 | Biscuits (57), plot diagram (67), Instagram sum (68), slides project (84), demonstration (85) | Judges six classroom cases. |
| A coin that always lands heads | 3 | The statistics lesson and Table 3.1 (76–80) | Watches heads come up and says when the claim is believed. |
| Eight words in order, twice | 3 | Mnemonics on "radio, shell, nurse" (81–83) | Learns one list by repeating and one by a chain of pictures. |
| Four kinds of numbers | 4 | Scales of measurement and the three test cases (98–100) | Reads a short lesson, rates their understanding, sorts five new cases. |
| Which problem is the same? | 4 | Cocktail sauce and miles to work (106) | Solves one word problem and picks which of three others is solved the same way. |
| One word, before and after | 4 | Hurricane, "eye" and "pressure" (107–108) | Gives the first meaning of two words before and after a weather report. |
| Three plots and one idea | 4 | Irony in three plays (112–114) | Finds what three plots share, then finds it in a new plot. |
| Three depths of knowing | 4 | Rote, shallow, deep (101–105) | Places five student answers at a depth. |
| Too many things at one time | 5 | 19 × 6 and the huge sum (119), butterfly and dragonfly (120) | Two sums and two word questions, all in the head. |
| Numbers first, then letters | 5 | Working-memory test in the note (139) | Sorts mixed letters and numbers in the head, row growing from three; two logic questions. |
| Six decisions about practice | 5 | Parapluie (130), 120 minutes (131), cramming (131–133), forgetting graphs (128–129) | Answers six questions and sees the research. |
| A hotel bill and a strange law | 5 | Pesos (133), the pen law (133–136) | One question on each, timed. |
| A cricket series and a bag of marbles | 5 | Basketball series and urn (139) | Two probability questions that are one sum. |
| Seven clues and seven guesses | 6 | The *House* case (145–146) | Chooses the doctor's guess after each clue. |
| How does somebody become an expert? | 6 | Violin hours (153–155), ten-year rule (156), eye movements (161), expert self-talk (152) | Five guesses. |
| A rod in a tilted frame | 7 | Figure 7.2 (171–173) | Sets a rod upright four times with a slider, then finds a triangle hidden in a box. |
| Three questions about your own head | 7 | Imagery questions (174), "footbath" (175) | Answers three questions and says how each answer was found. |
| Pictures and spoken words | 7 | Anne and Victor (176), Kathy (168) | Names their own style, then learns eight pictures and eight spoken words. Uses the browser's voice, and prints the words if there is none. |
| What do you believe about intelligence? | 8 | PISA statement (204), Felix and Mel (202) | Rates the statement and makes three choices. No right answers. |
| Five guesses about intelligence | 8 | Four tests (192–194), twins table (196), basketball twins (198–200), Flynn effect (200–201) | Five guesses. |
| Numbers, backwards | 9 | Backward digit span, Figure 9.1 (220) | One guess, then a backward span test from three numbers up. |
| A letter and a number in four boxes | 9 | Task switching, Figure 9.2 (221–222) | 8 practice and 48 real trials. The page compares the time after a change of task with the time after a repeat. |
| One sentence with three endings | 9 | Barbecue with three endings (226–229) | Picks the fact used for each ending. |
| Money now or more money later | 9 | Ice cream (237), delay discounting (238) | One question, then fifteen choices that find what ₹10,000 after a month, a year and five years is worth today. |
| Practice, or only experience? | 10 | Driving (253–254), five features of deliberate practice (255) | One guess, then five questions about their own last study sitting. |

**What was corrected in the first twelve.** The guide now gives the book's own versions: the letter demonstration has seventeen letters (CNN, PHD, LOL, GMT, FAQ), the cards are A, 2, B, 3 and BEER, 31, COKE, 17, the shallow question is about A and Q, the picture-word figure is from Rosinski and colleagues (1975), the number sentence reads "Picture this commonplace scene", and the book tells the doctor's problem before the general's.

**How the new numbers were checked.** Read in full: Ericsson and colleagues (1993), Buswell (1922), Yeager and colleagues (2019), the OECD PISA 2018 executive summary, Dickens and Flynn (2001), MacLeod and colleagues (1986), Cepeda and colleagues (2006), Rohrer and colleagues (2005), and the 2016 draft of Green, Rao and Rothschild. Read as a summary only: Rogers and Monsell (1995), Green, Myerson and Ostaszewski (1999), Ellis and colleagues (1998), Rosinski and colleagues (1975), Van Overschelde and Healy (2001), Pashler and colleagues (2008). Not opened: Gignac (2015), Kyllonen and Christal (1990), Bower and Clark (1969). The guide in the lab says this for each station.

**Where the lab differs from the book, on purpose.**
- The book's "about 20% slower" for task switching and its "15 to 20%" for the four cards could not be confirmed. The cards say they are the book's figures. The papers that were opened give about 10% for the four cards.
- The violin question uses the paper's figures for age 18 (7,410, 5,301 and 3,420 hours), and mentions the book's graph for age 20.
- For the series and marbles study, the people tested were sports writers and analysts, the marbles were in jars, and the measure was how well the answers hung together. The card says so.
- Backward digit span: two later papers found a very small fall on the same data. The card says so.

**What is not a station, and why.** Studies that need a laboratory or many years (hypnosis and forty drawings, brain scans of visual and verbal people, the gene studies, the reading-time diaries), advice written for teachers (story structure, how to praise, the questions before buying technology, the five-step video method), and pictures of an idea (the astrolabe, the Chinese room, Table 7.1, Gardner's eight intelligences, Table C.1).

**Limits to tell students.** The stations where the student only guesses a result or judges a case are not in the count at the top of the result sheet. One person and two short lists can't test learning styles, and the card says so. The rod-and-frame pull is weak on a lit screen. The joined word list always comes second. Five choices for each wait give only a rough money value.

**Testing.** 23 November 2026, headless Chrome: a bot played all 42 stations through the real buttons in one run with no console errors, and home, setup, guide and the new drawn cards were looked at on laptop and phone width.

### Activities to add next

- A recall test after the paragraph without a title, with half the class getting the title first and half not at all, as in the original, using exported files.
- A second round of the number-code sentence after five minutes of practice with the code, to show the decoding getting faster.
- A drawing version of the "seen a thousand times" station with a ten-rupee coin.
- A research audit that opens Hyde and Jenkins (1973), Barclay and colleagues (1974), Rogers and Monsell (1995), Gignac (2015) and Kyllonen and Christal (1990) in full.
- A class version of the letters-and-numbers station that plots each student's longest row against a reasoning score from exported files.

## Expert and Novice Lab

One file, `expert-novice-lab.html`, added on 15 November 2026. It has two classic experiments on how an expert's knowledge is arranged differently from a beginner's, and the student does both on themselves. It fits Lecture 6 (Chunking). No slide is mapped to it yet.

### What the student does

1. **Sort 24 physics problems** (about 12 minutes). The student gets 24 Class 11 mechanics problems as plain text cards, and puts the ones they would solve in a similar way into the same pile. They tap a card and then tap a pile (or drag on a laptop), make as many piles as they want, and name each pile at the end. They don't solve anything.
2. **Rebuild a chess position** (about 6 minutes). A board with 24 to 26 pieces is shown for 5 seconds and then cleared. The student puts back what they remember by tapping a piece and then a square. They do four boards: two from real games and two where the same pieces are on squares picked by chance. It works for students who have never played.

The home page asks the student to do both before opening the Guide, because the Guide gives away what the experiments look for.

### What the student gets back

- **Sorting.** A verdict in plain words (mostly by what is in the problem, mostly by the principle that solves it, partly both, or neither), two agreement numbers out of 100, a reading of every pile ("4 of 5 have a spring. They are solved in 3 different ways"), whether each pile name is an object or a principle, two pairs of the student's own cards to look at again (two they put together that are solved differently, and two they kept apart that are solved the same way), and the 24 cards shown three ways: the student's piles, by object, and by principle with one line on why.
- **Chess.** Pieces put back correctly on real boards and on chance boards, next to the master, Class A player and beginner in the paper. Then, for every board, the student's own board with each piece numbered in the order it was placed and coloured by burst, a line on what held each burst together, a reading of the order (row by row, one colour first, one kind of piece at a time, or by pieces that guard and attack each other), and for real boards one way a strong player might group the position, with how many pieces of each group the student got.
- Every run is kept on the device, with CSV and JSON export. A run that is stopped half way is not saved.

### How it is built

- The 24 problems were written for this lab. Each has one object (ramp, spring, rope or pulley, spinning disc, car or truck, something thrown or falling; four cards each) and one principle (energy 7, Newton's second law 8, momentum 5, angular momentum 4). Objects and principles are mixed so every object comes with three or four principles. This follows the design of Chi's Study 2. The count of 24 and the text-only cards follow Study 1.
- The agreement numbers are the adjusted Rand index between the student's piles and each of the two ways of sorting, floored at 0 and shown out of 100. The verdict cut-offs (both below 12 is "neither"; a gap of more than 10 decides between object and principle) are the lab's own.
- Pile names are read with a small word list. "Angular motion" and "rotation" count as object words, because that is how Chi's novices used them. "Angular momentum" counts as a principle.
- The three real positions are Fischer against Spassky, 1972, game 6, after Black's 16th move (24 pieces), and two well-known opening lines of the Sicilian Dragon and the Italian Game (26 pieces each). They were generated by replaying the moves with a script that checks every move. Chance positions put the same pieces on random squares, as in the paper.
- A pause longer than 2.5 seconds starts a new burst. The paper used 2 seconds with real pieces and says 2.5 gives the same results.
- For every two pieces placed one after the other, the lab works out the paper's five relations (attack, defence, touching squares, same colour, same kind) on the board as the student built it.
- The "strong player's groups" for each real position were written for this lab.
- Tested 15 November 2026 in headless Chrome with a bot that plays both experiments through the real buttons, at laptop and phone width, in both themes, with no console errors.

### The research behind it (opened 15 November 2026)

- **Chi, Feltovich and Glaser (1981)**, *Cognitive Science* 5(2), 121–152. Full text read. Eight physics PhD students and eight undergraduates after one semester of mechanics sorted 24 Halliday and Resnick problems "based on similarities of solution", without pen and paper. Piles: 8.4 against 8.6. Time: 18 minutes against 12. Novice piles were "angular motion", "springs", "inclined planes"; expert piles were "second law", "energy principles", "momentum principles". In Study 2 a fourth-year physics major sorted by principle qualified by object.
- **Chase and Simon (1973)**, *Cognitive Psychology* 4(1), 55–81. Full text read. Three players. After 5 seconds with a middle-game position of 24 to 26 pieces, the master placed about 16, the Class A player about 8, the beginner about 4. On random positions the paper prints no numbers and says all three did worse than the beginner on real positions. Chunk size in the memory task 2.5, 2.1, 1.9; first chunk 3.8, 2.6, 2.4; chunks per board 7.7, 5.7, 5.3. The within-chunk and across-pause percentages on the result sheet were added up by this lab from Table 5, which was read through OCR.
- **Gobet and Simon (1996)**, *Psychonomic Bulletin & Review* 3(2), 159–163. Author preprint read. Reads Chase and Simon's graph as 3.0, 2.5 and 2.0 pieces on random positions, and finds a small skill effect on random positions across 13 experiments (about one piece per 400 rating points).
- **Wolf, Dougherty and Kortemeyer (2012)**, arXiv version read. Says attempts to repeat Chi's experiment often fail, the result depends on the problem set, and the original problems are lost.
- **de Groot (1965)** was not opened. The lab only names it as the earlier work.

### What to tell students about the limits

- The chess paper does not say that beginners remember "all the pawns" or "the left side" and masters remember "who defends whom". It found the same kinds of relation between pieces at all three skill levels. The master's chunks were bigger and there were more of them. The lab's reading of the student's order (row by row, one colour first, one kind at a time) is the lab's own, and the Guide says so.
- Both original studies were small: 8 and 8 people, and 3 people.
- Our students have done Class 11 and 12 physics, so many will sort partly by principle. That is what Chi's fourth-year student did.
- Picking pieces from a row on a screen makes it a little quicker to place the same kind of piece twice, which pushes everyone towards placing one kind at a time.

### Activities to add next

- A Projector mode for the chess experiment, where the class sees one board and each student rebuilds it on their own phone.
- A second sorting deck from a subject where our students are the experts and the teacher is the novice (cricket situations, or Class 10 maths), so they see the effect from the other side.
- Repeating the same position until it is perfect, as Chase and Simon did, to watch the chunks grow over trials.
- A class view that collects exported files and plots the whole class on object agreement against principle agreement.

## Thinking, Fast and Slow Lab

One file, `thinking-fast-and-slow-lab.html`, that takes a student through fourteen of the small experiments in Daniel Kahneman's *Thinking, Fast and Slow* (2011), in the order of the book's five parts, and tells them at each one whether System 1 got its way. It fits Lecture 5's slide 9 (System 2 and the very small room) and works as homework for any lecture that names the two systems. The Add-1 task from chapter 2 is already in the Working Memory Lab, so it is not repeated here.

### What the student does

Fourteen stations, about thirty minutes for the whole tour; any station runs alone, and a station card on the home page selects only that one. Every station is a short sequence of cards: a question, an answer, and then a card that says what happened, what most people do, and what the book says. The home page opens with a two-column card of the differences between the systems (fast and automatic against slow and effortful, always on against called in, resemblance against rules, jumps to a conclusion against doubts) and a strip that cycles through examples of each.

**Part I · Two systems.** 1. *Two questions* (chapter 1): a drawn angry face, then 17 × 24 in the head. The page times both; the first takes a fraction of a second and no decision, the second takes effort. 2. *Two lines* (chapter 1): the Müller-Lyer figure. The student sets the line with outward fins until it looks equal to the line with inward fins, three times, then sees the two drawn equal with guides. 3. *Colour words* (chapter 3): a Stroop test, six practice words then 36 that count, twelve each of XXXX, a colour word in its own ink, and a colour word in another ink; keys R, G, B, Y or buttons. 4. *Fast answer, then check* (chapter 3): the bat and the ball, the widgets, the lily pads, the roses syllogism, and Moses's ark. Each question is asked twice: once with a twelve-second clock for the first answer that comes, once with no clock to check it. 5. *Fill the blanks* (chapter 4): a counting task over six food words or six washing words (chosen at random), then six fragments (SO_P, _RY, B_TTER, W_SH, _EAT, S_AP), typed one letter each. 6. *Words you have seen before* (chapter 5): Zajonc's Turkish words shown 0, 1, 2, 5, 10 and 25 times, then rated for how good their meaning is likely to be. 7. *Alan and Ben* (chapter 7): the same six traits in two orders, each rated as a project partner.

**Part II · Heuristics and biases.** 8. *The wheel* (chapter 11): a wheel that only stops at 10 or 65, then the United Nations question, then five more estimates each with a random low or high anchor (the redwood, Gandhi, the Ganga, the Qutub Minar, a red blood cell). 9. *What kills more people* (chapters 12 and 13): the letter K question and six pairs of causes of death with current world and Indian figures. 10. *Linda, the dice and the farmer* (chapters 14 to 16): Linda, the three dice sequences, Steve the librarian with an Indian base rate, and the Green and Blue cabs. 11. *Praise and scold* (chapter 17): two predictions, then the student is the flight instructor for twenty landings scored by a ten-sided die, praising or scolding after each, and then asked what worked.

**Part III · Overconfidence.** 12. *Ninety percent sure* (chapter 24): ten numbers, ten 90-percent ranges.

**Part IV · Choices.** 13. *Sure thing or gamble* (chapters 26 to 34): the outbreak in the lives-saved frame, ₹9,000 for sure or 90 percent of ₹10,000 as a gain and as a loss, the two decisions at once, the coin toss that gives the loss aversion ratio, the Allais pair at ₹52 lakh and ₹50 lakh, and the outbreak again in the deaths frame.

**Part V · Two selves.** 14. *The two noises* (chapter 35): the student sets the level, hears eight seconds of a harsh noise and the same eight seconds followed by eight more of a softer one (order random), rates both, and chooses one to hear again.

*Projector* mode makes the type bigger, adds a Skip button, shows both anchors at the wheel (odd roll numbers take one, even the other), and records nothing; the teacher presses the answer the class gave by show of hands and the reveal follows. When a run starts the page takes over the window and asks for full screen (best effort). **Stop** or **Esc** ends a run; finished stations are kept.

### What the student gets back

A result sheet per run. At the top: at how many stations System 1 got its way, out of the stations that can show it (the illusion was there, the word cost time, the anchor pulled, the story beat the base rate, and so on), and a **System 2 score** out of 100 that counts only the stations with a right answer: Fast answer then check (5), What kills more people (7), Linda and friends (4), Praise and scold (3), Ninety percent sure (10 ranges, mapped so that 9 or 10 hits is 100), Sure thing or gamble (3 pairs that should agree). The score is the average of those stations' percentages; a run with none of them has no score and no point on the trend. Below that, one block per station with its headline (the Stroop cost in milliseconds, the illusion in percent, the exposure lift in points, the loss aversion ratio, the hits out of ten), its own table or bars, and a reading that names the effect, gives the original result, and says what to do about it. A panel at the top of Results, *Your two systems, in one line*, shows the latest figure from every station the student has ever run. Runs stopped early keep their finished stations and carry the same confidence tiers as the other labs (provisional at half the planned stations, premature below that). History, a trend line of the System 2 score, CSV and JSON export (one column per station measure, about 130 columns for a full tour), and a copyable summary, all in local storage.

### Using it in class

Set the whole tour as homework before the lecture that names the two systems, and ask students to bring one number: at how many stations System 1 got its way. In class, choose *Projector* and run four or five stations by hands: Two questions, Fast answer then check, The wheel (split the room by roll number and compare the two averages), Linda, and Sure thing or gamble. Fill the blanks only proves anything as a class tally: who counted food words, who counted washing words, how many SOUPs and how many SOAPs. The stations get easier the second time, because the answers are remembered, so compare first runs between friends rather than a student's own second run.

### How it is built

- One file, no network. Fonts (Bodoni Moda, Jost) embedded as base64; the same palette, result-sheet layout, confidence tiers and export as the other labs. Red marks System 1 and steel blue marks System 2 throughout.
- Every station is an async function built from a small set of cards (choose, number, range, letter, scale, slider, continue) whose handlers are bound before the card is painted, so a fast tap is never lost, and whose waits and inputs can be aborted, so Stop, Esc, leaving full screen or navigating away unwinds cleanly and saves the finished stations.
- Reaction times use the event's own timestamp against the card's paint time (two animation frames after render). The Stroop word is drawn with theme-aware ink colours so yellow reads on both grounds.
- The wheel is an SVG disc rotated by a CSS transition to a rigged stop; the Müller-Lyer figure is SVG redrawn on every slider move; the noises are Web Audio (white noise through a high-pass filter with a buzzing square wave and a slow tremolo for the harsh sound; the same noise through a low-pass filter at well under half the gain for the soft one).
- Light and dark themes, phone layout, keyboard and screen-reader labels.

### The research behind it (not yet audited)

Each station's source is given in the page's guide. The figures below were checked against the book's text and against the papers' published results as recorded in the notes this lab was built from; none of the papers was opened during the build on 13 September 2026, so this lab is not yet covered by the research audit and its numbers should be verified the same way the other three labs were before they are relied on in class.

- **Two systems.** Kahneman (2011), chapters 1 to 3. The names are from Stanovich and West (2000), *Behavioral and Brain Sciences* 23, 645–665. Pupil dilation under load: Kahneman and Beatty (1966), *Science* 154, 1583–1585.
- **Müller-Lyer.** Chapter 1 uses it as the picture of a cognitive illusion you can know about and still see. Illusion sizes vary with fin angle and length; the guide gives 10 to 25 percent as common and makes no stronger claim.
- **Stroop.** Stroop (1935), *JEP* 18, 643–662; MacLeod (1991), *Psychological Bulletin* 109, 163–203. Interference in keypress versions is usually 100 to 200 ms. Chapter 3 gives a paper-and-pencil version with columns of words; the page does not claim to reproduce its exact wording.
- **Cognitive Reflection Test.** Frederick (2005), *Journal of Economic Perspectives* 19(4), 25–42: 3,428 respondents, mean 1.24 of 3; MIT 2.18. Chapter 3: more than 50 percent of Harvard, MIT and Princeton students gave the intuitive answer to the bat and ball, more than 80 percent at less selective universities; a large majority of college students call the roses syllogism valid. Moses illusion: Erickson and Mattson (1981), *JVLVB* 20, 540–551; chapter 6. The two-phase design (quick answer, then check) is this lab's own and is described as such.
- **Priming.** Chapter 4's EAT → SOUP, WASH → SOAP. Word-level priming: Meyer and Schvaneveldt (1971), *JEP* 90, 227–234; fragment completion: Tulving, Schacter and Stark (1982), *JEP: LMC* 8, 336–342. The same chapter's Florida effect (Bargh, Chen and Burrows, 1996) failed to replicate in Doyen and others (2012), *PLoS ONE* 7, e29081; money priming (Vohs, Mead and Goode, 2006) failed in Rohrer, Pashler and Harris (2015), *JEP: General* 144, e73–e85, and Caruso and others (2017), *JEP: General* 146, 1068–1088; Kahneman's 2017 comment on Schimmack's blog says he placed too much faith in underpowered studies. The page says all of this.
- **Mere exposure.** Zajonc (1968), *JPSP* 9(2, Pt. 2), 1–27: Turkish words at 0, 1, 2, 5, 10 and 25 exposures, rated on good–bad; liking rose with frequency. Zajonc and Rajecki (1969), *Psychonomic Science* 17, 216–217: the newspaper study in chapter 5. Bornstein (1989), *Psychological Bulletin* 106, 265–289: 208 experiments; the effect is reliable, strongest with brief exposures, and levels off after ten to twenty. The words here (kadirga, saricik, nansoma, iktitaf, afworbu, zabulon) are from Zajonc's list; kadırga is Turkish for a galley and iktitaf for plucking.
- **Halo and order.** Asch (1946), *Journal of Abnormal and Social Psychology* 41, 258–290, series A and B; chapter 7.
- **Anchoring.** Tversky and Kahneman (1974), *Science* 185, 1124–1131 (Appendix A of the book): the wheel at 10 and 65, medians 25 and 45. Jacowitz and Kahneman (1995), *PSPB* 21, 1161–1166: the redwood at 180 and 1,200 feet, means 282 and 844. Strack and Mussweiler (1997), *JPSP* 73, 437–446: Gandhi at 9 and 140. The page reports, for one person, how often the estimate fell on the anchor's side of the truth and how far along the way it travelled; it says that the two-group average is the real measure and gives the class version.
- **Availability.** Tversky and Kahneman (1973), *Cognitive Psychology* 5, 207–232: the letter K; 105 of 152 judged the first position more common for a majority of the letters. Lichtenstein, Slovic, Fischhoff, Layman and Combs (1978), *JEP: HLM* 4, 551–578; the stroke and tornado figures are as chapter 13 quotes them. Death figures: WHO Global Status Report on Road Safety 2023 (1.19 million, 2021); WHO Global Tuberculosis Report 2024 (1.25 million, 2023); Global Terrorism Index 2024 (8,352, 2023); IATA Annual Safety Report (244 on commercial flights in 2024, 72 in 2023); International Shark Attack File (10 unprovoked deaths in 2023, 4 in 2024); WHO snakebite fact sheet (81,000 to 138,000 a year); UNODC Global Study on Homicide 2023 (458,000, 2021); WHO suicide fact sheet (727,000, 2021); NCRB, Accidental Deaths and Suicides in India 2022 (2,887 lightning deaths); Suraweera and others (2020), *eLife* 9, e54076 (about 58,000 snakebite deaths a year in India, 2000 to 2019); EM-DAT via Our World in Data (about 45,000 disaster deaths a year on average in the 2010s); WHO diabetes fact sheet (1.6 million direct deaths, 2021). The page shows the source under each pair.
- **Representativeness.** Tversky and Kahneman (1983), *Psychological Review* 90, 293–315: Linda, 85 percent of Stanford business students chose the conjunction; the dice sequences, 65 percent chose the dominated one. Steve: Tversky and Kahneman (1974) and the book's introduction; the Indian base rate is Census 2011 (118.7 million cultivators). The cab problem: chapter 16; Bayes gives 41 percent and the common answer is 80.
- **Regression.** Chapter 17's flight instructors; Galton (1886). The praise-and-scold game is this lab's own design and the page says the landings are dice.
- **Overconfident ranges.** Alpert and Raiffa (1982) in *Judgment under Uncertainty* (the 1969 report); Russo and Schoemaker (1992), *Sloan Management Review* 33(2), 7–17: more than 2,000 managers, 90 percent ranges right 42 to 62 percent of the time; Ben-David, Graham and Harvey (2013), *QJE* 128, 1547–1584: 80 percent ranges right 36 percent of the time; chapter 24 says about a third.
- **Prospect theory.** Kahneman and Tversky (1979), *Econometrica* 47, 263–291; Tversky and Kahneman (1981), *Science* 211, 453–458: the Asian disease, 72 percent chose the sure thing in the saved frame and 78 percent the gamble in the deaths frame; the concurrent decisions, 73 percent chose A and D and 3 percent B and C. Allais (1953), *Econometrica* 21, 503–546; chapter 29 gives the 61/63 and 98/100 version. Loss aversion ratio 1.5 to 2.5: chapter 26; Tversky and Kahneman (1992), *Journal of Risk and Uncertainty* 5, 297–323.
- **Peak-end.** Kahneman, Fredrickson, Schreiber and Redelmeier (1993), *Psychological Science* 4, 401–405: 14 °C for 60 s against 60 s plus 30 s at 15 °C; 69 percent chose to repeat the long trial. Schreiber and Kahneman (2000), *JEP: General* 129, 27–42: the same with aversive sounds. Redelmeier and Kahneman (1996), *Pain* 66, 3–8. The page's noises (8 s harsh, then 8 s softer) follow the design, not the exact stimuli.
- **Replications.** Wagenmakers and others (2016), *Perspectives on Psychological Science* 11, 917–928 (the pen-in-mouth study); Hagger and others (2016), *Perspectives on Psychological Science* 11, 546–573 (ego depletion); Meyer and others (2015), *JEP: General* 144, e16–e30 (disfluent fonts, 16 studies, more than 7,000 people). None of these effects is used in the lab.

### Activities to add next

1. **Words that rhyme** (chapter 8): VOTE–NOTE against VOTE–GOAT, timed. Rhymes with different spellings take longer, because System 1 computes the spelling nobody asked for: the mental shotgun, measured.
2. **How happy are you** (chapter 9): the substitution question, in two orders, as a class split; only works between groups.
3. **The Add-1 pupil watch** (chapter 2): in pairs, one student does add-3 on the Working Memory Lab while the partner times the pupil on a second phone.
4. **Learn today, test tomorrow** (chapter 20's illusion of validity, made honest): predict a mark, then get it, across the term; a personal calibration curve.
5. **The class wheel**: a projector page where the teacher types the odd and even averages after the anchoring question and the two bars are drawn on the spot, with the anchoring index.
6. **The invisible gorilla** (chapter 2): needs the video; a link and a counting task, with the page only asking the question afterwards.

### What to tell students about the limits

Every trap in this lab catches most people most of the time, including the researchers who found it, and none of it is a diagnosis. One person is one data point for the between-group effects (priming, the wheel, the outbreak frames); the class tally is the demonstration. The stations get easier the second time because the answers are remembered, so the trend line is partly memory. The two-phase check station is this lab's design, not Frederick's; the praise-and-scold game and the ninety-percent question bank are also the lab's own. Some of chapter 4 did not survive replication, and the page says which parts.

## Disturbance Lab

One file, `disturbance-lab.html`, for the class activity on Lecture 5, slide 7: *Remember Seven Digits While I Ruin It*. Slide 6 explains the effect (why a dripping tap is worse than a fan), slide 7 runs it, and slide 8's rule for the focus block at home ("if something nearby keeps making irregular noise, move, or drown it in something steady") follows from the result. The page does the whole thing on a phone or a laptop, or drives the projector while the class writes on paper.

### What the student does

Four rounds, about five minutes alone, twelve in class. The task never changes: seven digits appear one at a time at one per second (or all at once for five seconds, the slide's version), vanish, and the student types them back in order on a keypad. After every list an overlay shows the board over what was typed, cell by cell, coloured by what went wrong (in place, right digit in the wrong place, not on the board, not on the board but said by the voice just before, left blank). Between rounds a card says what is about to change and nothing else does.

1. **Silence.** Nothing plays. The baseline. The other rounds are compared with it.
2. **Loud steady noise.** White noise (Web Audio, a looped two-second buffer) from the countdown until Enter, at a level set on a slider, with a *Hear the noise* button to check it first. The setup says: as loud as a busy road, not painful.
3. **A quiet voice reading numbers.** The device's own speech (Web Speech API, preferring an Indian-English voice, then British, then any English) reads random single digits, no immediate repeats, about one a second, from the countdown until Enter. Every spoken digit is logged with a timestamp, and so is every keystroke. A device with no speech voice falls back to tones that change pitch, and the result sheet says so.
4. **Keep talking (the slide's bonus round).** The student keeps saying "the, the, the" out loud at about two a second, paced by a pulse, from the countdown until Enter. This is articulatory suppression, in the form the research uses. The times table of 3, 5 or 7 is offered as the class version from the slide.

Settings: 7 or 10 digits; 1, 2 or 3 lists per round (1 is what the class does and is a coin toss; 2 is the default; 3 is the fair test); one at a time or all at once (Projector mode switches to all at once by itself); alone or **Projector** mode, in which the screen shows the digits, plays the sound, gives twenty seconds to write, reveals the answer for self-scoring, and ends with an answer key for all rounds without recording anything; and which rounds to run. Every list is a fresh random list of distinct digits with no runs of three, which is how the research draws them.

### What the student gets back

A result sheet per solo run. The headline is the **cost of the voice**: digits in place in silence minus digits in place with the voice, per list. The verdict says which pattern appeared: *The voice cost you digits. The noise did not.*, *Both the noise and the voice cost you digits*, *The noise cost you digits. The voice did not.*, or *No clear cost this time*, each with a reading that says what it usually means and when to run again with three lists. A cost counts as real when it is at least one digit with one or two lists per round, or half a digit with three. Measurements: digits in place per round (with perfect lists), the cost of each sound against silence, digits typed that were not on the board (voice round against the quiet rounds), digits typed that the voice had said in the two seconds before the keystroke, and the share of errors in the disturbed rounds that were the right digit in the wrong place. Then round-by-round bars and every list with the board over the answer. The **score out of 100** is plain: the percentage of digits in the right place across every list of the run. Runs stopped early after at least two lists are scored as provisional (half weight) or premature (quarter weight). History, trend line, CSV and JSON export, and a copyable summary, all in local storage.

### Using it in Lecture 5

Open the page on the projector, choose *Projector*, one list per round, all four rounds, and play the noise and the voice once through the room's speakers before starting. Run it straight through. The *Reveal* button (or Enter) scores each round by a show of hands. Ask three questions after the reveal in Round 3: who got all seven in silence, who got all seven with the voice, and who has a digit on their page that was never on the board. Expect the third question to get a few hands. The research does not predict copied digits; it predicts the order falling apart. Then set the solo run with three lists per round as that night's homework and ask students to bring back one number: digits lost to the voice.

### How it is built

- One file, no network. Fonts (Bodoni Moda, Jost) embedded as base64; the same palette, result-sheet layout, confidence tiers and export as the other two labs.
- Each list is an async flow (intro, countdown, present, respond, feedback) whose waits and inputs can be aborted, so Stop, Esc, leaving full screen or navigating away unwinds cleanly, stops the sound and the voice, and saves a partial run when there is enough to score.
- The noise is a Web Audio buffer source with a gain ramp. The voice is `speechSynthesis`, with a silent unlock utterance spoken inside the start tap so phones allow the later ones. The pulse for Round 4 is visual only, so that round adds no sound of its own.
- The digit row sizes itself to the panel with container query units, so seven or ten digits fit a phone, a laptop and a projector.
- Light and dark themes, phone layout, keyboard and screen-reader labels.

### The research behind it (checked 13 September 2026)

Each line says what the paper found and how it was checked. "Full text" means the paper itself was read; "abstract" means only the abstract could be opened.

- **Noise versus speech.** Salamé and Baddeley (1987), *Ergonomics* 30, 1185–1194 (abstract). Three experiments, nine visually presented digits, serial recall. Speech in an unfamiliar language disrupted recall at both 75 and 95 dB(A); noise at the same levels had no effect in the first two experiments; the third tested overt rehearsal under 95 dB(A) noise. Round 2 against Round 3.
- **Size of the effect.** Salamé and Baddeley (1989), *QJEP* 41A, 107–122 (full text). Nine digits at one per 750 ms. Errors: silence 36.6%, instrumental music 41.4%, vocal music 50.8%; in a third experiment, speech disrupted more than instrumental music, and pink noise shaped like the loudness of speech did nothing. Beaman (2004), *JEP: LMC* 30, 1106–1118, gives the usual estimate of 30 to 50% more errors. On seven digits that is about half a digit to one digit per list. The earlier version of this page said "one to three of seven", which is about double the research figure.
- **Loudness.** Ellermeier and Hellbrück (1998), *JEP: HPP* 24, 1406–1414 (abstract). The same disruption from speech and music at 60 and at 75 dB(A); adding pink noise over the speech improved recall linearly with the speech-to-noise ratio, which is slide 8's "drown it in something steady". Schlittmeier and others (2008), *Ergonomics* 51, 719–736 (abstract): at 35 dB(A), speech too faint to understand no longer disrupts. So "loudness does not matter" holds between about 60 and 95 dB(A).
- **Changing state.** Jones, Madden and Miles (1992), *QJEP* 44A, 645–669, and Jones and Macken (1993), *JEP: LMC* 19, 369–381 (abstracts). A single repeated word or tone does not disrupt; words or tones that change do. LeCompte, Neely and Wilson (1997), *JEP: LMC* 23, 472–483: tones disrupt less than speech. Colle and Welsh (1976), *JVLVB* 15, 17–31, first showed the effect with speech in a language the students did not know (about a 12% drop on eight consonants); Salamé and Baddeley (1982), *JVLVB* 21, 150–164, with words read over a visual digit list.
- **It hits order.** Beaman and Jones (1997), *JEP: LMC* 23, 459–471: tasks that need serial order are hit hardest; Salamé and Baddeley (1990), *Bulletin of the Psychonomic Society* 28, 540–542: free recall of sixteen words was unaffected; Beaman and Jones (1998), *QJEP* 51A, 615–636: free recall of long lists is affected too. Hughes and Jones (2005), *JEP: HPP* 31, 316–327: a stream of the same digits in a different order disrupts more than other words, which is why the voice reads digits here.
- **Copied digits.** No paper that could be opened reports how often a spoken digit is written down. The page tests the slide's prediction with a narrow window (the voice said the digit in the two seconds before the keystroke) and compares digits-not-on-the-board across rounds, and the reading says the match can be chance.
- **Keep talking (articulatory suppression).** Murray (1968), *JEP* 78, 679–684, introduced the method (repeat "the"). Baddeley, Thomson and Buchanan (1975), *JVLVB* 14, 575–589 (full text): counting one to eight at about three a second, from before the list until recall; suppression has a large effect on visual lists and little on spoken ones. Chincotta and Underwood (1997), *European Journal of Cognitive Psychology* 9, 89–96 (full text): digits on a screen, "la-la" at two a second; span fell from 7.31 to 5.78 across six languages. The earlier version cited Baddeley, Lewis and Vallar (1984), *QJEP* 36A, which is about spoken lists and has no digit-span figure; that citation was wrong.
- **Individual differences and self-knowledge.** Ellermeier and Zimmer (1997), *JASA* 102, 2191–2199 (abstract): 72 people; effects were normally distributed from slight facilitation to severe disruption; retest correlation 0.45 after four weeks; people were poor judges of their own impairment. Röer and others (2017), *Journal of Cognition* 1, 2 (full text): telling people what to expect changed how disturbed they felt, not how disturbed they were.
- **Habituation.** Bell, Röer, Dentale and Buchner (2012), *JEP: LMC* 38, 1542–1557, and Röer, Bell and Buchner (2014), *Memory and Cognition* 42, 609–621 (abstracts): people do get used to one recording played again and again; new speech keeps disturbing. The earlier version said habituation was weak and cited Banbury and others (2001), *Human Factors* 43, 12–29, whose abstract carries no such claim.
- **Standard procedure.** Leist, Lachmann and Klatte (2023), *Memory and Cognition* (full text): five to nine items, one at a time, at one to two per second; steady-state sounds have little or no effect. Röer and others (2017): eight digits at one per second, sound at 65 dB(A). No study shows the whole list at once for five seconds, which is why one at a time is now the default.
- **Music.** Salamé and Baddeley (1989): vocal music disrupts a lot, instrumental music less, speech more than instrumental. Vocal music and speech were not compared in the same experiment.
- **The mechanism.** Hughes (2014), *PsyCh Journal* 3, 30–41: two kinds of distraction, interference from changing sound (which cannot be switched off by trying harder) and capture by a sudden deviant sound.

### Activities to add next

1. **The slide's bonus round, timed.** Everyone counts aloud in sevens while a recording counts in threes; the page keeps the beat, then plays the recording, and measures how many beats the count survives.
2. **A voice you cannot understand.** A second Round 3 with a Hindi, Tamil or German voice from the same speech engine, to show the effect does not need meaning (Colle and Welsh's result). This is also the clean test of "only change matters", since the digit voice was chosen to be as disruptive as possible.
3. **Words versus no words.** A round with a short vocal loop and one with the same loop instrumental, for the "music helps me study" argument.
4. **A spatial control.** A Corsi-style pattern (tap squares in order) under the same voice, to show the effect is on verbal order and spares spatial work.
5. **The masking round.** Voice and white noise together, at a level the student sets until the voice is covered, to demonstrate slide 8's rule directly (Ellermeier and Hellbrück, experiment 2).
6. **Class bars.** A projector-mode page where the teacher types the hands-up counts after each round and the class's four bars are drawn on the spot.

### What to tell students about the limits

One list per round is a coin toss and the result sheet says so. The noise round can look costly by chance, or because the first list under it was startling; the research result is no cost at any loudness tested. A digit from the voice on the page is a hint, not proof: the voice says a digit every second. Round 4 only measures anything if the student keeps talking. The effect differs a lot from person to person, and a few people show none. None of this is a diagnosis.

## Working Memory Lab

One file, `working-memory-lab.html`, that lets a student measure their own working memory six ways and, in the same sitting, watch a chunk form. It is the in-class or at-home activity for Lecture 5, minus the revision quiz: slides 9 to 20 (System 2 and the very small room, about four things, find where your working memory runs out, say them back plus one, what a chunk is, how a chunk forms) and slide 30's four places to lose something.

### What the student does

Instruments I to VI, about 25 minutes for the whole set; each can be run alone.

1. **Digit span.** Digits appear one per second. Type them back in order, then in reverse. One success at a length moves the list up by one; two misses at the same length end the ladder. Span is the longest list got right. Modelled on the Wechsler rule, starting at 3 (or 4, as in class). The Wechsler test itself starts at two digits, always gives both lists, and is spoken. This is the lecture's Activity 3, done alone.
2. **Digits, plus one (Kahneman's Add-1 and Add-3).** Digits arrive on a beat with a click; after a two-beat pause a red +1 (or +3) appears and the student types the changed digits one per beat: 6 5 0 2 becomes 7 6 1 3, and 9 wraps to 0. Two grace beats per list; a list counts only if every digit is right and typed in time. Add-one ladder, then add-three. This is the lecture's Activity 4, done alone, and the result sheet compares it with the student's own forward span. There are no published norms for these spans; the comparison with the student's own digit span is the fair one.
3. **Formulas as chunks (the chunking demonstration, chemistry).** Characters from Class 9 to 12 chemistry appear one at a time at 0.7 s each. In the scrambled half they are shuffled so that as few two-character sequences as possible match any real formula and no two digits sit together. In the formula half the same kinds of characters spell compounds the student knows, run together with no gaps: N a C l H 2 S O 4 C O 2. The student types back what they saw; typing is checked without case, a typed 0 counts as O, and a typed capital I counts as small l (the pool has no iodine). Scrambled lists start at 4 characters and grow by one; formula lists start at 2 formulas and grow by one formula. After every list the target is shown with the compounds named, so the student sees which chunks they have and which they do not. This is the lecture's 1947-1947 moment (slide 14) and slides 16 to 19, measured.
4. **Coloured squares (Luck and Vogel's change detection).** 2, 4, 6 or 8 coloured squares flash for 100 ms, a blank for 900 ms, then one square returns inside a ring. Same or different? Keys S/D or arrows, or buttons. Capacity is Cowan's K = set size × (hits − false alarms), reported per set size and averaged over sets of four and up. 24 trials at each of 4, 6 and 8 squares, 8 at 2. This is slide 13's "about four once you cannot secretly rehearse".
5. **Hold items while counting (Brown–Peterson).** Three consonants (or four digits, the slide's version) for two seconds, then 3, 9 or 18 seconds of counting backwards in threes on the keypad to a one-second beat (each number submits itself after three digits), then the items again. Four trials per delay in random order. A "just wait" control lets the student repeat the items instead, to show it is the counting rather than the time that empties the space. This is slide 13's "interrupted for 15 seconds. Gone."
6. **A repeated list (Hebb's repetition effect).** 24 lists (or 15) of digits, one longer than the student's own forward span (taken from their last Instrument I run; 8 if none). Every third list is secretly the same list. Recall is scored by digits in position; a blank key lets the student skip a lost position. At the end the page asks whether they noticed anything, then reveals the list and plots recall list by list: the repeated list climbs while the random ones stay flat. It is the shortest demonstration we know of something held in working memory leaving a long-term trace through spaced repetition, and it answers the lecture's "a chunk is not built in one sitting" (slide 17) with one being built in eight minutes.

When a run starts, the task takes over the whole window and asks the browser for full screen (best effort). **Stop** or **Esc** ends a run early; leaving full screen by any route ends the run. Leaving the tab during a list voids that list and repeats it.

### Why chemistry

The chunk round needs material that nearly everyone in a first-semester engineering cohort holds as automatic units, so that identical characters can be shown with and without their meaning. Chemical formulas fit: they are strings of letters and digits, every student who passed Class 10 science carries dozens (H2O, NaCl, H2SO4, CaCO3, NaHCO3), and Class 11 and 12 add the organic and d-block ones (KMnO4, K2Cr2O7, C6H5OH, CH3COOH, CHCl3). The hierarchy symbol → formula → equation mirrors slide 17's steps joining into a method. The pool (about 90 compounds, each with its common name) leaves out anything needing brackets, anything with iodine, and the p-block and s-block compounds (XeF4, B2H6, SF6) that the 2023 NCERT rationalisation removed, which now only coaching-prepared students know. Physics (the equations of motion) was the runner-up, but formulas with fractions and superscripts do not break cleanly into a one-character-at-a-time stream.

### What the student gets back

Every run produces a result sheet: a headline figure, a **score out of 100**, the measurements, a short reading tied back to the lecture, and the full trial table. A panel at the top of Results shows the latest figure from each instrument side by side. History accumulates in local storage (up to 150 runs), with a trend line of the last ten scores per instrument. Runs stopped early are scored from what was measured if they pass the minimum (two lists on the ladders, sixteen square trials, four leak trials, nine repeat lists) and carry the same confidence tiers as the other labs (provisional ½ weight, premature ¼).

| Instrument | Headline | Other measures |
|---|---|---|
| I Digits | Forward span → backward span | lists right, where in a list the first slip came |
| II Plus one | Add-one span → add-three span | cost against own digit span, % of digits on the beat, average lateness, lists that ran out of beats |
| III Formulas | Scrambled characters → characters as formulas | formulas held at once, chunk factor, the chunks that carried you (named), the formulas in the lists that broke |
| IV Squares | K | K per set size, accuracy, false-alarm rate, the timer's estimate of the flash |
| V Leak | % of items kept after the longest delay | retention curve, halfway point, counting pace and accuracy, trials counted too slowly to block rehearsal |
| VI Repeat | Points gained on the repeated list | first vs last repetitions, gain per repetition, random-list baseline and drift, perfect recalls, whether the repeat was noticed |

Score bands are the lab's own, anchored to published norms where they exist (digit span, K) and chosen by hand where they do not (plus one, formulas, repeat): digits (forward 4 → 20, 5 → 40, 6 → 60, 7 → 75, 8 → 90, 9 → 100; backward 2 → 10, 4 → 55, 6 → 90, 7 → 100), plus one (add-one 3 → 30, 5 → 70, 7 → 100; add-three 3 → 50, 6 → 100), formulas (70% from formula characters 8 → 30, 16 → 68, 28 → 100 and 30% from scrambled 5 → 40, 9 → 100), squares (K 1 → 20, 2 → 50, 3 → 72, 4 → 90, 5 → 100), leak (mean % kept over filled delays), repeat (gain 0 → 20, 10 → 45, 20 → 65, 30 → 80, 45 → 100).

### Using it in Lecture 5

The natural slot is slides 13 to 15 (about 25 minutes in the script), with I and III as the core and II if time allows; IV, V and VI work well as the "tonight" homework, since V and VI take a few minutes each and VI is the one students talk about afterwards. Run I first: II and VI read the student's forward span from it. Ask students to bring back three numbers: forward span, scrambled-to-formula characters, and the repeated-list gain. They map onto the checkpoint questions on slide 31.

### How it is built

- One file, no network. Fonts (Bodoni Moda, Jost) embedded as base64; the same palette and result-sheet layout as the other labs.
- Every trial is an async flow (present, respond, record) whose waits and inputs can be aborted, so Stop, Esc, leaving full screen or navigating away unwinds cleanly and saves a partial run when there is enough to score.
- An on-screen keypad mirrors the physical keyboard and stamps each digit with the event's own timestamp, which is how the plus-one round measures lateness against the beat. The letters in the leak round use a text box.
- Beats are Web Audio clicks with a visual pulse; the lists, the scrambles and the formula picks are generated fresh every run.
- The desk on the home page is a small looping animation of the lecture's picture: four slots fill, a fifth item pushes one off, then 1947 1947 takes two slots.
- Light and dark themes, phone layout, keyboard and screen-reader labels.

### The research behind it (checked 13 September 2026)

- **Miller (1956) and Cowan (2001).** Miller, *Psychological Review* 63, 81–97 (full text): the span of immediate memory is about seven chunks and recoding into bigger chunks raises what it holds. Cowan, *Behavioral and Brain Sciences* 24, 87–114 (abstract): Miller's seven was a rough estimate; once rehearsal and grouping are blocked the limit is three to five, about four. Instrument I measures the former, IV the latter.
- **Digit span.** Woods and others (2011), *Journal of Clinical and Experimental Neuropsychology* 33, 101–111 (full text): spoken digits at one per second; 29 adults aged 18 to 46 (mean 26): forward 7.41 (SD 0.94), backward 6.00 (SD 1.32); 763 adults aged 18 to 65: 6.52 and 4.91. The paper also quotes the WMS-III norms for ages 20 to 29: 6.74 forward, 5.07 backward. The Wechsler rule: two lists per length, stop when both fail. The earlier version of the game called 5 to 6 forward "typical" and 7 to 8 "above average"; 7 is the mean.
- **Add-1 and Add-3.** Kahneman and Beatty (1966), *Science* 154, 1583–1585 (abstract): the pupil widens as digits are presented and narrows during report. Kahneman (2011), *Thinking, Fast and Slow*, chapter 2 (full text): metronome at one per second, wait two beats, report on the beat; 5294 becomes 6305; "few people can cope with more than four digits in the Add-1 task"; Add-1 with four digits widened the pupil more than holding seven digits; Add-3 was the most demanding task he ever measured. No published norms for either span.
- **Chunking.** Chase and Simon (1973), *Cognitive Psychology* 4, 55–81 (full text): three players, five-second view; the master placed about 16 pieces of a real middle-game position, the Class A player about 8, the beginner about 4; on random positions there was no relation between memory and skill. Simon (1974), *Science* 183, 482–488 (full text): in a self-experiment, about 7 one-syllable words, about 4 two-word phrases, about 3 phrases of six to ten words. Bower and Springston (1970), *JEP* 83, 421–430 (not opened; every secondary source gives the example FBI PHD TWA IBM against FB IPH DTW AIB M). Zhilin and Tkachuk (2013), *International Journal of Physics and Chemistry Education* 5, 39–56: chemists and non-chemists shown real and scrambled chemical equations; experts better only on the real ones. Ericsson, Chase and Faloon (1980), *Science* 208, 1181–1182 (abstract): SF went from 7 to 79 digits after more than 230 hours; Chase and Ericsson (1981), *Skilled memory* (full text): his consonant span stayed about 6, with no transfer.
- **Change detection.** Luck and Vogel (1997), *Nature* 390, 279–281 (full text): 100 ms array, 900 ms blank, set sizes 1 to 12, seven colours, about four items; no change with a 500 ms flash or a spoken load. Rouder, Morey, Morey and Cowan (2011), *Psychonomic Bulletin and Review* 18, 324–330 (full text): Cowan's K for single-probe designs, which this is. Xu, Adam, Fang and Vogel (2018), *Behavior Research Methods* 50, 576–588 (full text): 137 students, single probe, 150 ms array, 1 s blank: K 2.32 at four squares, 2.10 at six, 1.98 at eight; with daily practice K rose from 2.15 to about 3.0 in a month. Luck and Vogel (2013), *Trends in Cognitive Sciences* 17, 391–400: the typical college student holds 3 to 4 objects.
- **Brown–Peterson.** Peterson and Peterson (1959), *JEP* 58, 193–198 (full text): consonant trigrams, count backwards by threes or fours to a metronome at two clicks a second, delays 3 to 18 s. Counting all answers, about 80% at 3 s, 57% at 6 s, 9% at 18 s (their figure 2); counting only quick answers, about 53%, 40% and 6% (their figure 3, the textbook curve). Letters and numbers were chosen so that the two would interfere as little as possible, which is why the game now holds letters by default. Their second experiment: three seconds of spoken rehearsal before the counting raised recall from 60/25/14% to 80/48/34% at 3/9/18 s. There was no "just wait" condition; that mode is the lecture's. Keppel and Underwood (1962), *JVLVB* 1, 153–161 (not opened; described in Neath and Brown, 2012, and Lin and Luck, 2012): little forgetting on the first trial; interference from earlier lists drives much of the curve.
- **Hebb repetition.** Hebb (1961), in *Brain Mechanisms and Learning* (not opened; described in Page and Norris, 2009): nine-digit lists, the same list every third trial, better recalled even by people who did not notice. Page and Norris (2009), *Philosophical Transactions B* 364, 3737–3753 (full text): about eight repetitions among some twenty other lists; recall rises about 3 to 4 points per repetition from a start near 50%. Norris, Page and Hall (2018), *Memory* 26, 852–857 (full text): lists one past span, eight repetitions. Szmalec and others (2009), *QJEP* 62, 435–443 (full text): nine-syllable lists, every third trial, 12 repetitions, 2.6 points per repetition against 0.2 for fillers. Araya, Oberauer and Saito (2022), *Memory and Cognition* 50, 925–940 (full text): eight-item lists, eight repetitions, gains of 12 to 19 points. Guérard and others (2011), *Memory and Cognition* 39, 1012–1022 (abstract): awareness did not affect recall gains; Weitz and others (2011), *American Journal of Psychology* 124, 49–62 (abstract): found learning only in those who noticed.
- **Why there is no in-session "testing effect" instrument.** Roediger and Karpicke (2006), *Psychological Science* 17, 249–255 (full text): at five minutes restudy beats retrieval (81% against 75%); retrieval wins after two days (68 against 54) and a week (56 against 42). Rowland (2014), *Psychological Bulletin* 140, 1432–1463 (full text): g = 0.41 under a day, 0.69 beyond. A demonstration inside one sitting would show the wrong result. Retrieval and spacing belong to Lectures 7 and 8, with a test the next day or later.
- **Training transfer.** Melby-Lervåg, Redick and Hulme (2016), *Perspectives on Psychological Science* 11, 512–534 (abstract): 87 publications, 145 comparisons; no convincing far transfer from working-memory training.
- **Browser timing.** Anwyl-Irvine and others (2021), *Behavior Research Methods* 53, 1407–1425 (full text): requested durations overrun by about 12 ms on Windows and 25 ms on macOS on average. Bridges and others (2020), *PeerJ* 8, e9414 (full text): online duration variability mostly under 5 ms, with one-frame lags on some browser and system combinations. The result sheet shows the timer's own estimate of the flash, not a display measurement.

### Activities to add next

1. **Learn today, test tomorrow.** Twelve chemistry pairs the students do not yet hold (the IUPAC names and symbols of elements 104 to 118 from Class 11 Unit 3: Rf, Db, Sg … Og), half restudied three times, half retrieved twice with feedback; the test appears on the next visit at least twelve hours later. The fair version of the testing effect, and the bridge to Lecture 7.
2. **Operation span.** Turner and Engle's complex span (solve "(3 × 2) + 1 = 7?" between letters to remember), the standard research measure; Redick and others (2012), *European Journal of Psychological Assessment* 28, 164–171, give norms from 6,236 people.
3. **Formula round for other subjects.** A physics bank (SI units and constants as tokens) or a maths bank (derivative pairs), selectable at the start, to show the chunk effect follows expertise rather than the subject.
4. **Within-group scramble.** A third formula condition where the compounds are real but the characters inside each are shuffled (S4OH2), to separate "I know the set" from "I know the order".
5. **Chunk ladder across weeks.** Store the formulas that broke a list and re-serve them a week later, to show a chunk forming across sessions rather than within one.
6. **Pupil watch.** In pairs in class, the partner watches the student's eyes during add-three; the page provides the beat and the digits on one phone and a stopwatch for dilation onset on the other.

### What to tell students about the limits

Single runs are noisy and everything moves with sleep and time of day. Spans have small practice effects; the squares and the formula round have larger ones (K rose by nearly a point over a month of daily practice in Xu's sample; the formula pool becomes familiar). A low formula span says something about which chunks are built, not about capacity. The repeated-list effect is small per repetition and can fail to show in one run, especially if the lists are too easy or too hard. None of this is a diagnosis.

## Attention Lab

One file, `attention-lab.html` (~250 KB, no network needed), that lets a student measure their own attention span four different ways. Send the file as an attachment or host it anywhere; it runs in the browser and stores results only on the student's device.

### What the student does

1. **Count the seconds (the clock).** A real analog watch. The student watches the red second hand and keeps a silent count from zero. At surprise checkpoints (every 45 to 110 s by default, plus one at the end) the dial vanishes and they type their count. Pressing **D** the moment they notice their mind has wandered records a *self-caught drift* and restarts the count. Leaving the tab also counts as a drift. A second mode turns the dial into a Mackworth clock: a lone pointer steps once a second and now and then skips a step; the student presses Space when they see it.
2. **Press for every digit except 3 (SART).** Digits 1 to 9 flash for 250 ms with a 900 ms mask, in five random sizes. Press for every digit except 3. 18 practice digits with feedback, then 225 (or 90) scored digits with none. The instructions say to favour accuracy over speed.
3. **Stop the counter (PVT-B).** After a random 1 to 4 s wait measured from the previous response, a millisecond counter starts; stop it as fast as possible. 3 minutes; lapses are responses over 355 ms. The 10-minute standard form uses 2 to 10 s waits and 500 ms.
4. **Tap on the beat (MRT).** A tone every 1.3 s; tap on every tone. The spread of tap-to-beat offsets (jitter) rises in the seconds before people report that their mind wandered.

When a run starts, the task takes over the whole window and asks the browser for full screen (best effort: phones and some browsers refuse, and the task still fills the page). The **Stop** button in the corner or **Esc** ends a run early. Browsers swallow the Esc that leaves full screen, so the page also listens for the full-screen change itself: leaving full screen by any route ends the run.

Thought probes ("Just before this appeared, where was your attention?") can be switched on for the clock, digits and metronome, with four answers: on the task; wandering and I knew it; wandering and I had not noticed; my mind was blank. They separate *tune-outs* (wandering the student had noticed) from *zone-outs* (wandering they had not).

### What the student gets back

Every run produces a result sheet with a headline figure, a **score out of 100**, the measurements, and a short reading. Students can **Download CSV**, **Download JSON** (full raw event data) or **Copy summary** and send it to you, or press **Run again**. History accumulates in the browser's local storage (up to 150 runs, each with its score), and the results page draws a **trend line of the last 10 scores** for each instrument, with a weighted average, best and change-since-last-run. The home cards show the last score and a sparkline per instrument.

#### Stopping early

A run stopped with Esc, Stop, or by leaving full screen is scored from whatever was measured, as long as it passed the instrument's minimum (about 20 s of the clock or one skip, 18 scored digits, 5 reactions, 15 beats). Shorter than that, nothing is saved and a toast says why. Each saved run carries a confidence tier from how much of the planned run was done:

| Tier | When | Weight in the trend average |
|---|---|---|
| Complete run | reached its natural end | 1 |
| Stopped early · provisional | at least half the run done | ½ |
| Premature · low confidence | less than half | ¼ |

The result sheet opens with a sentence saying how much was done and that a partial run tends to flatter, since attention usually slips later in a run. Filled points on the trend line are complete runs; hollow points were stopped early.

#### How the score is computed

The bands are the lab's own, informed by the research where norms exist (the SART error range, PVT lapse counts) and chosen by hand where they do not (clock stretches, rhythm jitter). Scores are only comparable within one instrument.

| Instrument | Score |
|---|---|
| Clock, count | 0.4 × focus-stretch band (45 s ≈ 35, 2 min ≈ 60, 5 min ≈ 85, 10 min = 100) + 0.6 × checkpoints (tracking 1, slipping ½, lost 0); −5 per tab-away. Stretch only if no checkpoint was reached. |
| Clock, skip watch | hit rate % − 4 per false alarm |
| Digits | 100 × (1 − commission rate) × (1 − omission rate) |
| Reaction | 0.6 × lapse-rate band (0 → 100, 5% → 85, 15% → 60, 30% → 30, 50% → 0) + 0.4 × response-speed band (mean 1/RT: 3.8/s → 100, 3.2 → 80, 2.7 → 55, 2.1 → 25, 1.5 → 0); −3 per false start |
| Rhythm | jitter band (30 ms → 100, 60 → 75, 100 → 45, 150 → 15) × (1 − omission rate); −1 per extra tap, max 10 |

Runs saved by earlier versions of the file keep their stored score; a run with no score gets one the first time the new file loads it.

Headline figures per instrument:

| Instrument | Headline | Other measures |
|---|---|---|
| Clock, count | Typical focus stretch (median time before a self-caught drift; "≥ run length" if never pressed) | checkpoints tracked (within 5% or 3 s) / slipping / lost, longest clean interval, counting rate (fast/slow bias), tab-aways, probe answers |
| Clock, skip watch | Skips caught / total | false alarms, median reaction, first- vs second-half hit rate |
| Digits | % presses on the 3 (commission errors) | omissions, mean RT, RT coefficient of variation, speed before errors vs before correct withholds, first/second half |
| Reaction | Lapses over 355 ms | response speed (mean 1/RT), median/mean RT, fastest and slowest 10%, false starts, first vs last minute |
| Rhythm | Timing jitter (SD of tap offset) | average offset, missed beats, extra taps, jitter before "wandering" vs "on task" probes |

### How the clock is built (for the curious)

- One `requestAnimationFrame` loop for the whole app. Every hand position and every event time is derived from `performance.now()` or `Date.now()` at render time; nothing counts frames or ticks, so a stalled or overloaded machine drops frames but never drifts. The loop only exists while something is on screen and the browser pauses it in hidden tabs.
- The tick animation (quartz overshoot) is a CSS transition on a transform, so the main thread writes one style value per second in tick mode.
- Reaction times use the key event's own high-resolution timestamp rather than the time the handler ran, which matters when the thread is busy.
- Metronome tones are scheduled on the Web Audio clock a third of a second ahead, so the audio thread keeps time even if the page hiccups.
- Checkpoint prompts hide the dial instantly, so the count cannot be read off the face. Counting restarts after each checkpoint or drift so that each interval is an independent measurement and any lost checkpoint is, by construction, a lapse the student did not catch.
- Tab switches are detected via the Page Visibility API; the run pauses, records a drift, and restarts the count.
- Fonts (Bodoni Moda, Jost) are embedded as base64 so the page looks the same offline.

### The research behind it (checked 13 September 2026)

**"Attention span" is several things.** The literature separates sustained attention or vigilance (keeping watch for rare events and how that decays with time on task), lapses (momentary absences), and mind-wandering with or without awareness. A single number hides more than it shows, which is why the lab reports four.

- **Mackworth Clock.** Mackworth (1948), *QJEP* 1, 6–21 (not opened; parameters from Klein and Feltmate, 2025, *Frontiers in Cognition* 4, and other secondary sources): a pointer stepping round a dial, a rare double step as the signal, 12 signals per half hour at irregular gaps, two-hour watches; detection fell over the first half hour. Lichstein, Riedel and Richman (2000), *The Journal of Psychology* 134, 153–161 (not opened): a computerised version. The skip-watch mode here has ten to twenty times Mackworth's signal density and runs 3 to 15 minutes, so it demonstrates the task rather than reproducing his decrement. Decrements inside 5 to 12 minutes are documented only for demanding signals (Nuechterlein, Parasuraman and Jiang, 1983, *Science* 220; Temple and others, 2000, *Human Factors* 42).
- **Count-and-checkpoint.** Not a published test. The drift key follows the self-caught versus probe-caught distinction (Smallwood and Schooler, 2006, *Psychological Bulletin* 132; Schooler and others, 2011, *Trends in Cognitive Sciences* 15). Counting with a "lost count" key follows the Breath Counting Task (Levinson and others, 2014, *Frontiers in Psychology* 5, 1202: novices about 76% accurate, meditators 84%) and the Metronome Counting Task (Anderson and Farb, 2020, *Behavior Research Methods* 52, 2646–2656). There is no published distribution of focus stretches on a second hand; the bands are the lab's own.
- **SART.** Robertson, Manly, Andrade, Baddeley and Yiend (1997), *Neuropsychologia* 35, 747–758 (abstract; parameters confirmed from secondary sources): digits 250 ms, mask 900 ms, No-Go = 3, 225 trials, five font sizes; errors are preceded by faster responses. Manly and others (2000), *Clinical Neuropsychological Assessment* 3, 167–177 (via Peebles and Bothell, 2004): 109 healthy adults on the 225-trial version: 25.4% commission errors (SD 17.4), Go reaction 375 ms, 333 ms before an error against 384 ms before a correct withhold. Seli, Jonker, Cheyne and Smilek (2013), *Frontiers in Psychology* 4, 265 (full text): on a 630-trial version, undergraduates made 45% errors at 351 ms under standard instructions and 32% at 438 ms when told to go slow. Seli, Cheyne and Smilek (2012), *Consciousness and Cognition* 21, 277–291; Helton (2009), *JCEN* 31, 39–47; Dang, Figueroa and Helton (2018), *Experimental Brain Research* 236, 2255–2262: the speed-error link is largely a speed–accuracy choice, so a press on the 3 is a mix of lapses and haste. The earlier version quoted "about 45%" as the norm; that figure is from the longer task.
- **PVT and PVT-B.** Dinges and Powell (1985), *Behavior Research Methods, Instruments, and Computers* 17, 652–655 (full text): the original task, 10-minute trials with 1 to 10 s waits, false starts under 100 ms, analysis of the fastest and slowest 10%; no 500 ms rule. Basner and Dinges (2011), *Sleep* 34, 581–591 (full text): the standard protocol (2 to 10 s waits, lapse ≥ 500 ms, false start under 100 ms); lapses and mean 1/RT are the most sensitive outcomes (effect sizes near 1.9), median RT the least (0.38). Basner, Mollicone and Dinges (2011), *Acta Astronautica* 69, 949–959 (full text): PVT-B, 3 minutes, 1 to 4 s waits including the 1 s feedback, 355 ms threshold chosen to match the 10-minute lapse count. Antler and others (2022), *Frontiers in Neuroscience* 16, 815697 (full text): rested adults, lapses median 0 in 10 minutes and 1 (up to about 3) in 3 minutes; speed about 4 per second. Grant and others (2017), *Behavior Research Methods* 49, 1020–1029: touch devices give faster reactions than laptops, and device-specific thresholds help. The earlier version credited the 2 to 10 s waits and the 500 ms rule to Dinges and Powell; they are Basner and Dinges.
- **Metronome Response Task.** Seli, Cheyne and Smilek (2013), *JEP: HPP* 39, 1–5 (abstract): variability in the five taps before a probe was greater before reports of wandering than before reports of being on task. Seli, Carriere, Levene and Smilek (2013), *Frontiers in Psychology* 4, 430 (full text): tone every 1300 ms; reported wandering 46% with probes about 30 s apart and 79% at about 3 minutes; log-variance of the five-tap window 8.09 on task against 8.34 before wandering, which works back to roughly 57 and 65 ms. Anderson and others (2021), *Attention, Perception and Psychophysics* 83, 315–330 (abstract): replicated with 300 people. Safati and others (2024), *Frontiers in Psychology* 15: the trial is 650 ms of silence, a 75 ms tone, 575 ms of silence. The earlier version credited the probe-spacing numbers to the wrong Seli paper.
- **Thought probes.** Weinstein (2018), *Behavior Research Methods* 50, 642–661 (abstract): 145 studies, at least 69 methodological variants. Smallwood, McSpadden and Schooler (2007), *Psychonomic Bulletin and Review* 14, 527–533: the tune-out versus zone-out distinction. Jackson and Balota (2012), *Psychology and Aging* 27, 106–119 (full text): four options, on task, mind blank, drifted without noticing, drifted and noticed; the game now uses these. Robison, Miller and Unsworth (2019), *Behavior Research Methods* 51, 398–408: probe frequency and framing did not change responses in their experiments.
- **Lectures.** Wammes and others (2016), *Scholarship of Teaching and Learning in Psychology* 2, 13–32 (via Pachai and others, 2016): 154 students over a semester; unintentional wandering on 14% of probes and no rise across the lecture. Risko and others (2012), *Applied Cognitive Psychology* 26, 234–242 (abstract): wandering rose with time on task. The earlier version's "30 to 40% of probes, rising toward half" had no source.
- **Time estimation.** Zakay and Block (1995), the attentional-gate model (chapter not opened); Block, Hancock and Zakay (2010), *Acta Psychologica* 134, 330–343 (abstract): across 117 experiments, higher cognitive load shortens prospective duration judgments. A slow count is consistent with the model, but an explicit count is the strategy timing studies usually suppress, so the reading says "consistent with", not "a sign of".
- **Popular claims.** The 8-second "goldfish" span came from a 2015 Microsoft Canada report citing a statistics website that could produce no research (Maybin, BBC, 2017; Bradbury, 2016, *Advances in Physiology Education* 40, 509–513). Gloria Mark's 47 seconds measures screen-switching in knowledge workers (2.5 minutes in 2004, 75 s in 2012, 47 s recently), not a limit. The "10 to 15 minute lecture attention span" has no supporting study (Wilson and Korn, 2007, *Teaching of Psychology* 34, 85–89; Bradbury, 2016); Bunce, Flens and Neiles (2010), *Journal of Chemical Education* 87, 1438–1443: clicker reports show lapses as early as 30 s, again at about 4.5 minutes, short lapses dominating, and fewer lapses in the segments after demonstrations and clicker questions.
- **Browser timing.** Anwyl-Irvine and others (2021), *Behavior Research Methods* 53, 1407–1425 (full text): reaction times measured in a browser run about 70 to 100 ms long, with trial-to-trial jitter of 8 to 28 ms; visual durations run 10 to 30 ms long. Bridges and others (2020), *PeerJ* 8, e9414: online precision under 10 ms in most browsers. Fine for comparing a person with themselves, not for laboratory norms. The earlier version's "8 to 67 ms with 1 to 8 ms precision" does not appear in the paper.

### Activities to add next

Ideas ranked by how much they would add over the four already built:

1. **Reading with probes.** A short passage, random thought probes, comprehension questions at the end. Closest to real study, and the probe-caught rate maps directly onto reading research.
2. **Lecture lapse clicker.** Play a video; the student presses when they notice a lapse (Bunce's design). Plot lapses against the video timeline to show *when* in a lecture minds wander, and compare lecture formats.
3. **Metronome Counting Task (Anderson and Farb, 2020).** Tap to the beat while silently counting to 20; press a second key whenever you realise you lost count. Measures loss of meta-awareness directly.
4. **Gradual-onset CPT (gradCPT).** City and mountain scenes cross-fade every 800 ms; press for cities, withhold for mountains. Validated on 10,000+ people online; avoids SART's ceiling and speed confound.
5. **Time production with load.** Produce 5 s and 10 s intervals by holding a key, alone and while doing a 2-back. The dual-task cost is a clean index of attentional resources.
6. **Distraction resistance.** The clock task with optional fake notifications sliding in. Compare tracking accuracy with and without; students see the cost of a visible phone.
7. **A personal baseline for the counter.** Score later PVT runs against the student's own first rested run, which is what the browser-timing papers recommend.
8. **Vigilance curve.** A 20-minute skip-watch session with rarer, smaller skips and hit rate plotted per 4-minute block: a personal Mackworth decrement curve.

### What to tell students about the limits

Single runs are noisy; sleep, caffeine, time of day and the device all move the numbers. The PVT is free of practice effects (Dinges and Powell, 1985); the SART may not be. Probe wording and frequency can change reported mind-wandering by tens of percentage points in some studies (Seli and others, 2013), though not in all (Robison and others, 2019). A press on the 3 can be a lapse or a choice to go fast. None of this is a diagnosis or an ADHD screen; attention tests are used in clinics alongside history and interviews. Deliberate mind-wandering is not the same as spontaneous drifting and relates differently to learning.

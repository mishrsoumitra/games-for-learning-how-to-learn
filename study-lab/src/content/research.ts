/**
 * Published numbers quoted on the reveal screens and in the guide. Every figure here comes
 * from the research notes this app was built from (October 2026). Where a number is
 * contested, the guide says so.
 */

export interface Source {
  id: string;
  citation: string;
  url?: string;
}

export const SOURCES: readonly Source[] = [
  {
    id: 'kornell2008',
    citation:
      'Kornell, N. and Bjork, R. A. (2008). Learning concepts and categories: is spacing the "enemy of induction"? Psychological Science, 19(6), 585–592.',
  },
  {
    id: 'yan2016',
    citation:
      'Yan, V. X., Bjork, E. L. and Bjork, R. A. (2016). On the difficulty of mending metacognitive illusions: a priori theories, fluency effects, and misattributions of the interleaving benefit. Journal of Experimental Psychology: General, 145(7), 918–933.',
    url: 'https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/YanBjorkBjork2016.pdf',
  },
  {
    id: 'roediger2006',
    citation:
      'Roediger, H. L. and Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.',
    url: 'https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x',
  },
  {
    id: 'karpicke2008',
    citation:
      'Karpicke, J. D. and Roediger, H. L. (2008). The critical importance of retrieval for learning. Science, 319(5865), 966–968.',
    url: 'https://web.mit.edu/jbelcher/www/learner/retrieval.pdf',
  },
  {
    id: 'rowland2014',
    citation:
      'Rowland, C. A. (2014). The effect of testing versus restudy on retention: a meta-analytic review of the testing effect. Psychological Bulletin, 140(6), 1432–1463.',
  },
  {
    id: 'kornell2009',
    citation:
      'Kornell, N. (2009). Optimising learning using flashcards: spacing is more effective than cramming. Applied Cognitive Psychology, 23(9), 1297–1317.',
    url: 'https://sites.williams.edu/nk2/files/2011/08/Kornell.2009b.pdf',
  },
  {
    id: 'cepeda2008',
    citation:
      'Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T. and Pashler, H. (2008). Spacing effects in learning: a temporal ridgeline of optimal retention. Psychological Science, 19(11), 1095–1102.',
    url: 'https://journals.sagepub.com/doi/10.1111/j.1467-9280.2008.02209.x',
  },
  {
    id: 'rohrer2007',
    citation:
      'Rohrer, D. and Taylor, K. (2007). The shuffling of mathematics problems improves learning. Instructional Science, 35(6), 481–498.',
  },
  {
    id: 'rohrer2020',
    citation:
      'Rohrer, D., Dedrick, R. F., Hartwig, M. K. and Cheung, C.-N. (2020). A randomized controlled trial of interleaved mathematics practice. Journal of Educational Psychology, 112(1), 40–52.',
  },
  {
    id: 'brunmair2019',
    citation:
      'Brunmair, M. and Richter, T. (2019). Similarity matters: a meta-analysis of interleaved learning and its moderators. Psychological Bulletin, 145(11), 1029–1052.',
  },
  {
    id: 'tullis2013',
    citation:
      'Tullis, J. G., Finley, J. R. and Benjamin, A. S. (2013). Metacognition of the testing effect: guiding learners to predict the benefits of retrieval. Memory and Cognition, 41(3), 429–442.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3602315/',
  },
  {
    id: 'kirkjohnson2019',
    citation:
      'Kirk-Johnson, A., Galla, B. M. and Fraundorf, S. H. (2019). Perceiving effort as poor learning: the misinterpreted-effort hypothesis of how experienced effort and perceived learning relate to study strategy choice. Cognitive Psychology, 115, 101237.',
  },
  {
    id: 'deslauriers2019',
    citation:
      'Deslauriers, L., McCarty, L. S., Miller, K., Callaghan, K. and Kestin, G. (2019). Measuring actual learning versus feeling of learning in response to being actively engaged in the classroom. PNAS, 116(39), 19251–19257.',
    url: 'https://www.pnas.org/doi/10.1073/pnas.1821936116',
  },
  {
    id: 'yeo2019',
    citation:
      'Yeo, D. J. and Fazio, L. K. (2019). The optimal learning strategy depends on learning goals and processes: retrieval practice versus worked examples. Journal of Educational Psychology, 111(1), 73–90.',
  },
  {
    id: 'hartwig2012',
    citation:
      'Hartwig, M. K. and Dunlosky, J. (2012). Study strategies of college students: are self-testing and scheduling related to achievement? Psychonomic Bulletin and Review, 19(1), 126–134.',
  },
  {
    id: 'biwer2020',
    citation:
      'Biwer, F., oude Egbrink, M. G. A., Aalten, P. and de Bruin, A. B. H. (2020). Fostering effective learning strategies in higher education: a mixed-methods study. Journal of Applied Research in Memory and Cognition, 9(2), 186–203.',
  },
  {
    id: 'mayrhofer2023',
    citation:
      'Mayrhofer, R., Kuhbandner, C. and Frischholz, J. (2023). A reanalysis of Karpicke and Blunt (2011). Frontiers in Psychology.',
  },
];

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

/** Numbers shown next to the student's own result. */
export const PUBLISHED = {
  interleaving: {
    interleavedPct: 63,
    blockedPct: 42,
    didBetterWithInterleavingPct: 78,
    ratedBlockingAsGoodOrBetterPct: 78,
    sourceIds: ['kornell2008', 'yan2016'],
  },
  retrieval: {
    fiveMinutes: { rereadPct: 83, recallPct: 71 },
    oneWeek: { rereadPct: 40, recallPct: 61 },
    keptTestingPct: 80,
    droppedTestingPct: 35,
    predictedPct: 50,
    sourceIds: ['roediger2006', 'karpicke2008', 'rowland2014'],
  },
  spacing: {
    spacingBetterForPct: 90,
    believedMassingBetterPct: 72,
    sourceIds: ['kornell2009', 'cepeda2008'],
  },
  problems: {
    interleavedPct: 63,
    blockedPct: 20,
    sourceIds: ['rohrer2007', 'rohrer2020'],
  },
} as const;

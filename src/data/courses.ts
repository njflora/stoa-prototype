// Courses, in the format of the reference site's course shop: a type
// (Community, Course or Bundle), a title, a description and a price.
// The products are invented for the demo; the prices match the real
// site's price points. Their community is free, with a member and post
// count, so ours is too: a membership on your account, not lessons.

import { brand } from '@/config/brand'

export type CourseType = 'Community' | 'Course' | 'Bundle'

export interface Course {
  id: string
  type: CourseType
  title: string
  /** One or two sentences, for the card. */
  summary: string
  /** A longer introduction, for the course page. */
  about: string[]
  /** In pounds. Absent where the real site shows none. */
  price?: number
  teacherId: string
  /** An artwork id from media.generated.json. */
  artId: string
  modules: { title: string; lessons: number }[]
  /** For a bundle: the courses it includes. */
  includes?: string[]
  /** Related shows and series on the site. */
  related?: { label: string; to: string }[]
  /** For a community: its size and its forums. */
  community?: {
    members: number
    posts: number
    forums: Forum[]
  }
}

export interface Forum {
  name: string
  description: string
  /** "planned" forums are on the roadmap, not built. */
  status: 'open' | 'planned'
  /** Who can post: every signed-in account, or members only. */
  posting: 'all' | 'members'
  threads?: { title: string; by: string; replies: number; daysAgo: number }[]
}

export const courses: Course[] = [
  {
    id: 'philosophy-circle',
    type: 'Community',
    title: 'The Philosophy Circle',
    summary: 'Discuss the big questions with like-minded people, in monthly reading groups and an open forum.',
    about: [
      'The Philosophy Circle is a place to think out loud. Members read a short classic together each month and argue about it in the forum.',
      `Membership is free and sits on your ${brand.name} account, so there is nothing new to sign up for.`,
    ],
    price: 0,
    teacherId: 'richard',
    artId: 'death-of-socrates',
    modules: [],
    community: {
      members: 128,
      posts: 412,
      forums: [
        {
          name: 'General discussion',
          description: 'Questions, recommendations and the monthly reading.',
          status: 'open',
          posting: 'all',
          threads: [
            { title: 'This month: the Apology. First impressions?', by: 'northernlass', replies: 34, daysAgo: 0 },
            {
              title: 'Is Stoicism just good manners with a reading list?',
              by: 'Wessex_Walker',
              replies: 57,
              daysAgo: 1,
            },
            { title: 'Best translation of the Ethics for a beginner', by: 'quietreader', replies: 18, daysAgo: 3 },
            { title: 'Suggestions for next month’s book', by: 'chris_m', replies: 22, daysAgo: 5 },
          ],
        },
        {
          name: 'Ethics',
          description: 'How to live, and how to argue about it. Members only, to keep it civil.',
          status: 'open',
          posting: 'members',
          threads: [
            { title: 'Is it ever right to lie to protect someone?', by: 'GrumpyHistorian', replies: 41, daysAgo: 0 },
            { title: 'Virtue or rules: which is the better guide?', by: 'CanalBoatKev', replies: 29, daysAgo: 2 },
          ],
        },
        {
          name: 'Political philosophy',
          description: 'Justice, power and the state, from Plato to now.',
          status: 'planned',
          posting: 'members',
        },
        {
          name: 'Classics reading room',
          description: 'Slow reading of the ancient texts, a chapter at a time.',
          status: 'planned',
          posting: 'members',
        },
        {
          name: 'Book club',
          description: 'One modern book a month, chosen by members.',
          status: 'planned',
          posting: 'members',
        },
      ],
    },
    related: [{ label: 'Conversations', to: '/shows/conversations' }],
  },
  {
    id: 'virtue-ethics',
    type: 'Course',
    title: 'Virtue Ethics of the Ancients',
    summary:
      'A different way of seeing the human condition, through the moral thinkers of ancient Greece, from Homer to Aristotle.',
    about: [
      'What makes a good life, and a good person? Long before modern ethics, the Greeks asked these questions and gave answers that still hold up.',
      'This course follows the idea of virtue from the heroes of Homer, through Socrates and Plato, to Aristotle, and asks what it can teach us now.',
    ],
    price: 325,
    teacherId: 'helen',
    artId: 'school-of-athens',
    modules: [
      { title: 'Heroes and honour in Homer', lessons: 4 },
      { title: 'Hesiod and the working life', lessons: 3 },
      { title: 'Socrates and the examined life', lessons: 5 },
      { title: 'Plato: justice and the soul', lessons: 5 },
      { title: 'Aristotle: virtue as a habit', lessons: 6 },
      { title: 'The Stoics and what came after', lessons: 4 },
    ],
    related: [
      { label: 'Chronos: Athens and Sparta', to: '/series/athens-and-sparta' },
      { label: 'Chronos: Alexander the Great', to: '/series/alexander-the-great' },
    ],
  },
  {
    id: 'trivium',
    type: 'Bundle',
    title: 'The Trivium',
    summary: 'Grammar, logic and rhetoric: the three subjects a classical education began with, in one bundle.',
    about: [
      'For centuries, learning began with the trivium. Grammar teaches you to write clearly, logic to think straight, and rhetoric to persuade.',
      'This bundle includes all three courses. Take them in order, or start with the one you need most.',
    ],
    price: 375,
    teacherId: 'andrew',
    artId: 'ambassadors',
    includes: ['writing', 'logic', 'rhetoric'],
    modules: [],
  },
  {
    id: 'writing',
    type: 'Course',
    title: 'Writing Well',
    summary:
      'Clear writing makes for clear thinking. Grammar, sentence craft, punctuation and style, with the common mistakes to avoid.',
    about: [
      'Good writing is a skill, not a gift. This course works through the parts of speech, how sentences are built, how punctuation guides the reader, and how to develop a plain, readable style.',
    ],
    price: 150,
    teacherId: 'richard',
    artId: 'ambassadors',
    modules: [
      { title: 'The parts of speech', lessons: 4 },
      { title: 'Building a sentence', lessons: 5 },
      { title: 'Punctuation that helps the reader', lessons: 4 },
      { title: 'Style: plain and memorable', lessons: 4 },
      { title: 'Common mistakes, and how to fix them', lessons: 3 },
    ],
  },
  {
    id: 'logic',
    type: 'Course',
    title: 'Logic and Argument',
    summary: 'How to build a good argument and spot a bad one: deduction, syllogisms and the classic fallacies.',
    about: [
      'Every argument has a shape. This course teaches you to see it: what follows from what, where an argument breaks, and how to answer it fairly.',
    ],
    price: 150,
    teacherId: 'andrew',
    artId: 'geographer',
    modules: [
      { title: 'Terms and propositions', lessons: 4 },
      { title: 'Deductive reasoning', lessons: 5 },
      { title: 'The syllogism', lessons: 4 },
      { title: 'Arguments in the wild', lessons: 3 },
      { title: 'Fallacies and how to answer them', lessons: 5 },
    ],
  },
  {
    id: 'rhetoric',
    type: 'Course',
    title: 'The Art of Persuasion',
    summary:
      'Logic is rarely enough to change a mind. The classical art of rhetoric, its devices, and how people really decide.',
    about: [
      'People are not purely rational. This course covers the classical art of persuasion, the full set of rhetorical devices, and the mental shortcuts that shape how an audience responds.',
    ],
    price: 150,
    teacherId: 'tom',
    artId: 'cicero',
    modules: [
      { title: 'Ethos, pathos and logos', lessons: 4 },
      { title: 'Arranging a speech', lessons: 3 },
      { title: 'The classical devices', lessons: 6 },
      { title: 'How audiences decide', lessons: 4 },
      { title: 'Rhetoric in practice', lessons: 3 },
    ],
    related: [{ label: 'Chronos: The Fall of the Republic', to: '/series/the-fall-of-the-republic' }],
  },
]

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id)
}

/** Lessons across all modules; a bundle counts its courses' lessons. */
export function lessonCount(course: Course): number {
  if (course.includes) return course.includes.reduce((sum, id) => sum + lessonCount(getCourse(id)!), 0)
  return course.modules.reduce((sum, m) => sum + m.lessons, 0)
}

/** What the bundle's courses would cost bought one by one. */
export function separatePrice(course: Course): number | undefined {
  return course.includes?.reduce((sum, id) => sum + (getCourse(id)?.price ?? 0), 0)
}

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage.js'

// ─── XP thresholds per level ──────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: 'Junior SysAdmin',    minXP: 0,    color: 'text-slate-400' },
  { level: 2, title: 'SysAdmin',           minXP: 200,  color: 'text-accent-green' },
  { level: 3, title: 'Mid SysAdmin',       minXP: 500,  color: 'text-accent-cyan' },
  { level: 4, title: 'Senior SysAdmin',    minXP: 1000, color: 'text-brand-400' },
  { level: 5, title: 'Principal Engineer', minXP: 2000, color: 'text-accent-amber' },
  { level: 6, title: 'Infrastructure Pro', minXP: 3500, color: 'text-accent-purple' },
]

export function getLevelForXP(xp) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l
    else break
  }
  const nextIndex = LEVELS.indexOf(current) + 1
  const next = LEVELS[nextIndex] || null
  const progress = next
    ? Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100)
    : 100
  return { current, next, progress }
}

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first-lesson',   label: 'First Step',       icon: '🎯', desc: 'Complete your first lesson',         condition: (s) => s.completedLessons.length >= 1 },
  { id: 'five-lessons',   label: 'On a Roll',         icon: '🔥', desc: 'Complete 5 lessons',                 condition: (s) => s.completedLessons.length >= 5 },
  { id: 'first-quiz',     label: 'Quiz Taker',        icon: '📝', desc: 'Pass your first quiz',               condition: (s) => Object.keys(s.quizScores).length >= 1 },
  { id: 'perfect-quiz',   label: 'Perfect Score',     icon: '💯', desc: 'Score 100% on any quiz',             condition: (s) => Object.values(s.quizScores).some(q => q.score === 100) },
  { id: 'streak-3',       label: 'Consistent',        icon: '📅', desc: '3-day learning streak',              condition: (s) => s.streak >= 3 },
  { id: 'streak-7',       label: 'Week Warrior',      icon: '🗓️', desc: '7-day learning streak',              condition: (s) => s.streak >= 7 },
  { id: 'xp-500',         label: 'XP Hunter',         icon: '⚡', desc: 'Earn 500 XP',                        condition: (s) => s.totalXP >= 500 },
  { id: 'xp-1000',        label: 'XP Master',         icon: '🏆', desc: 'Earn 1,000 XP',                      condition: (s) => s.totalXP >= 1000 },
  { id: 'course-complete',label: 'Course Complete',   icon: '🎓', desc: 'Complete an entire course',          condition: (s) => s.completedCourses.length >= 1 },
]

// ─── Default state ────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  totalXP:          0,
  completedLessons: [],   // array of lesson IDs
  completedCourses: [],   // array of course IDs
  quizScores:       {},   // { lessonId: { score, passed, date } }
  earnedBadges:     [],   // array of badge IDs
  streak:           0,
  lastStudyDate:    null,
  lastVisited:      null, // { courseId, lessonId, lessonTitle, courseTitle, href }
}

export function useProgress() {
  const [state, setState] = useLocalStorage('sysadminpro_progress', DEFAULT_STATE)

  // ── Add XP ──────────────────────────────────────────────────────────────────
  const addXP = useCallback((amount) => {
    setState(prev => {
      const newXP    = prev.totalXP + amount
      const newState = { ...prev, totalXP: newXP }
      // Check for new badges
      const newBadges = BADGES
        .filter(b => !prev.earnedBadges.includes(b.id) && b.condition(newState))
        .map(b => b.id)
      return { ...newState, earnedBadges: [...prev.earnedBadges, ...newBadges] }
    })
  }, [setState])

  // ── Complete a lesson ────────────────────────────────────────────────────────
  const completeLesson = useCallback((lessonId, xpReward = 50) => {
    setState(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev
      const today    = new Date().toDateString()
      const lastDate = prev.lastStudyDate
      const streak   = lastDate === new Date(Date.now() - 86400000).toDateString()
        ? prev.streak + 1
        : lastDate === today ? prev.streak : 1
      const newXP    = prev.totalXP + xpReward
      const newState = {
        ...prev,
        totalXP:          newXP,
        completedLessons: [...prev.completedLessons, lessonId],
        streak,
        lastStudyDate:    today,
      }
      const newBadges = BADGES
        .filter(b => !prev.earnedBadges.includes(b.id) && b.condition(newState))
        .map(b => b.id)
      return { ...newState, earnedBadges: [...prev.earnedBadges, ...newBadges] }
    })
  }, [setState])

  // ── Save quiz score ──────────────────────────────────────────────────────────
  const saveQuizScore = useCallback((lessonId, score, passed, bonusXP = 0) => {
    setState(prev => {
      const newXP    = prev.totalXP + (passed ? bonusXP : 0)
      const newState = {
        ...prev,
        totalXP:    newXP,
        quizScores: {
          ...prev.quizScores,
          [lessonId]: { score, passed, date: new Date().toISOString() },
        },
      }
      const newBadges = BADGES
        .filter(b => !prev.earnedBadges.includes(b.id) && b.condition(newState))
        .map(b => b.id)
      return { ...newState, earnedBadges: [...prev.earnedBadges, ...newBadges] }
    })
  }, [setState])

  // ── Set last visited ─────────────────────────────────────────────────────────
  const setLastVisited = useCallback((data) => {
    setState(prev => ({ ...prev, lastVisited: data }))
  }, [setState])

  // ── Reset (dev tool) ─────────────────────────────────────────────────────────
  const reset = useCallback(() => setState(DEFAULT_STATE), [setState])

  return {
    state,
    addXP,
    completeLesson,
    saveQuizScore,
    setLastVisited,
    reset,
  }
}

export default useProgress

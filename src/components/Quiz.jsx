import React, { useState, useCallback } from 'react'
import { useProgress } from '../hooks/useProgress.js'

/**
 * Quiz — reusable quiz engine.
 * @param {string}   lessonId   — unique lesson ID, used as storage key
 * @param {string}   title      — quiz heading
 * @param {Array}    questions  — [{ id, question, options[], correct, explanation }]
 * @param {number}   passingScore — 0–100, default 70
 * @param {number}   xpReward   — bonus XP on pass
 * @param {function} onComplete — called with (score, passed) when finished
 */
export default function Quiz({
  lessonId,
  title = 'Lesson Quiz',
  questions = [],
  passingScore = 70,
  xpReward = 25,
  onComplete,
}) {
  const { state, saveQuizScore } = useProgress()

  // If already attempted, show results immediately
  const prior = state.quizScores?.[lessonId]

  const [answers,   setAnswers]   = useState({})       // { questionId: selectedIndex }
  const [submitted, setSubmitted] = useState(!!prior)
  const [results,   setResults]   = useState(prior || null)
  const [current,   setCurrent]   = useState(0)        // active question index (step mode)
  const [showExpl,  setShowExpl]  = useState({})       // { questionId: bool }

  const totalQ = questions.length
  const allAnswered = Object.keys(answers).length === totalQ

  // ── Select an answer ────────────────────────────────────────────────────────
  const select = useCallback((qId, idx) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qId]: idx }))
  }, [submitted])

  // ── Submit quiz ─────────────────────────────────────────────────────────────
  const submit = useCallback(() => {
    if (!allAnswered || submitted) return

    const correct = questions.filter(q => answers[q.id] === q.correct).length
    const score   = Math.round((correct / totalQ) * 100)
    const passed  = score >= passingScore

    const result = { score, passed, correct, total: totalQ, date: new Date().toISOString() }
    saveQuizScore(lessonId, score, passed, xpReward)
    setResults(result)
    setSubmitted(true)
    onComplete?.(score, passed)
  }, [allAnswered, submitted, questions, answers, totalQ, passingScore, lessonId, xpReward, saveQuizScore, onComplete])

  // ── Retry ───────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    setAnswers({})
    setSubmitted(false)
    setResults(null)
    setCurrent(0)
    setShowExpl({})
  }, [])

  // ── Results screen ───────────────────────────────────────────────────────────
  if (submitted && results) {
    const { score, passed, correct, total } = results
    return (
      <div className="card overflow-hidden">
        {/* Header band */}
        <div className={`px-6 py-5 flex items-center gap-4
                         ${passed ? 'bg-accent-green/10 border-b border-accent-green/20'
                                  : 'bg-accent-red/10    border-b border-accent-red/20'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                            ${passed ? 'bg-accent-green/20' : 'bg-accent-red/20'}`}>
            {passed ? '🏆' : '📚'}
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest
                           ${passed ? 'text-accent-green' : 'text-accent-red'}`}>
              {passed ? 'Quiz Passed!' : 'Not Quite — Try Again'}
            </p>
            <h3 className="text-xl font-bold text-white mt-0.5">{score}%</h3>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-white font-semibold">{correct}/{total} correct</p>
            {passed && (
              <p className="text-xs text-accent-amber font-mono mt-0.5">+{xpReward} XP earned</p>
            )}
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Review</p>
          {questions.map((q) => {
            const chosen   = answers[q.id]
            const isRight  = chosen === q.correct
            const wasShown = showExpl[q.id]
            return (
              <div key={q.id}
                   className={`rounded-xl border p-4
                                ${isRight ? 'border-accent-green/20 bg-accent-green/5'
                                          : 'border-accent-red/20    bg-accent-red/5'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{isRight ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-2">{q.question}</p>
                    {/* Options */}
                    <div className="space-y-1.5 mb-3">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                      ${i === q.correct
                                        ? 'bg-accent-green/15 text-accent-green font-medium'
                                        : i === chosen && !isRight
                                          ? 'bg-accent-red/15 text-accent-red line-through'
                                          : 'text-slate-500'}`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center
                                            text-[10px] font-bold flex-shrink-0
                                            ${i === q.correct ? 'border-accent-green bg-accent-green/20'
                                            : i === chosen && !isRight ? 'border-accent-red bg-accent-red/20'
                                            : 'border-surface-600'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    {/* Explanation */}
                    {q.explanation && (
                      <button
                        onClick={() => setShowExpl(p => ({ ...p, [q.id]: !p[q.id] }))}
                        className="text-[11px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                      >
                        {wasShown ? '▲ Hide explanation' : '▼ Show explanation'}
                      </button>
                    )}
                    {wasShown && q.explanation && (
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-surface-800
                                    rounded-lg p-3 border border-surface-700">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3 flex-wrap">
          {!passed && (
            <button onClick={retry} className="btn-primary">
              Retry Quiz
            </button>
          )}
          <button
            onClick={retry}
            className="btn-secondary"
          >
            {passed ? 'Review Again' : 'See Answers'}
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz taking screen ───────────────────────────────────────────────────────
  const q = questions[current]
  if (!q) return null

  const chosen    = answers[q.id]
  const answered  = chosen !== undefined
  const progress  = Math.round((Object.keys(answers).length / totalQ) * 100)

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-700 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Question {current + 1} of {totalQ}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-accent-amber">+{xpReward} XP on pass</span>
          {/* Step dots */}
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200
                            ${i === current
                              ? 'bg-brand-400 scale-125'
                              : answers[questions[i].id] !== undefined
                                ? 'bg-accent-green/60'
                                : 'bg-surface-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-surface-700">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-base font-semibold text-white leading-snug mb-5">{q.question}</p>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => select(q.id, i)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border
                          text-left text-sm transition-all duration-150
                          ${chosen === i
                            ? 'border-brand-500 bg-brand-500/10 text-white'
                            : 'border-surface-600 bg-surface-800/50 text-slate-300 hover:border-brand-500/50 hover:bg-surface-700'}`}
            >
              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center
                                text-[11px] font-bold flex-shrink-0 transition-all duration-150
                                ${chosen === i
                                  ? 'border-brand-500 bg-brand-500 text-white'
                                  : 'border-surface-600 text-slate-500'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        <div className="flex gap-2">
          {current < totalQ - 1 ? (
            <button
              onClick={() => setCurrent(c => c + 1)}
              disabled={!answered}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!allAnswered}
              className={`btn-primary disabled:opacity-40 disabled:cursor-not-allowed
                          ${allAnswered ? 'shadow-glow' : ''}`}
            >
              Submit Quiz ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

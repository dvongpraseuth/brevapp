'use client'

import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/lib/game-context'
import { QuestionCard } from '@/components/session/QuestionCard'
import { SessionResult } from '@/components/session/SessionResult'
import { T } from '@/lib/constants'
import type { Notion } from '@/lib/types'

export interface DynQuestion {
  notionId: string
  question: string
  reponse:  string
  conseil:  string
}

async function fetchQuestion(notion: Notion): Promise<DynQuestion> {
  const res = await fetch('/api/questions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notionId:    notion.id,
      notionLabel: notion.label,
      domain:      notion.dom,
      subject:     notion.sub,
    }),
  })
  if (!res.ok) throw new Error('Generation failed')
  return res.json()
}

export default function SessionPage() {
  const { notions, time, subject, handleAnswer, handleComplete } = useGame()

  const [idx,          setIdx]          = useState(0)
  const [shown,        setShown]        = useState(false)
  const [done,         setDone]         = useState(false)
  const [score,        setScore]        = useState({ ok: 0, flou: 0, non: 0 })
  const [answerStreak, setAnswerStreak] = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [cache,        setCache]        = useState<Record<string, DynQuestion>>({})
  const cacheRef = useRef(cache)
  cacheRef.current = cache

  const pool = notions
    .filter(n => n.sub === subject && n.st !== 'non_vu')
    .slice(0, Math.max(3, Math.floor(time / 5)))

  const loadQuestion = async (notion: Notion) => {
    if (cacheRef.current[notion.id]) return
    try {
      const q = await fetchQuestion(notion)
      setCache(prev => ({ ...prev, [notion.id]: q }))
    } catch {
      // Groq down — la question restera undefined, on passera à la suivante
    }
  }

  useEffect(() => {
    if (!pool.length) { setLoading(false); return }
    loadQuestion(pool[0]).then(() => {
      setLoading(false)
      if (pool[1]) loadQuestion(pool[1])
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currNotion = pool[idx]
  const currQ      = currNotion ? cache[currNotion.id] : undefined

  const answer = (res: 'ok' | 'flou' | 'non') => {
    const newStreak = res === 'ok' ? answerStreak + 1 : 0
    setAnswerStreak(newStreak)
    setScore(s => ({ ...s, [res]: s[res] + 1 }))
    handleAnswer(currNotion.id, res, res === 'ok' ? 30 : res === 'flou' ? 10 : 0, newStreak)

    if (idx + 1 >= pool.length) {
      setDone(true)
      handleComplete(time <= 10, { ...score, [res]: score[res] + 1 })
    } else {
      setIdx(i => i + 1)
      setShown(false)
      if (pool[idx + 2]) loadQuestion(pool[idx + 2])
    }
  }

  const restart = () => {
    setIdx(0); setShown(false); setDone(false)
    setScore({ ok: 0, flou: 0, non: 0 }); setAnswerStreak(0)
    setCache({}); setLoading(true)
    if (pool[0]) loadQuestion(pool[0]).then(() => {
      setLoading(false)
      if (pool[1]) loadQuestion(pool[1])
    })
  }

  if (!pool.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: T.text, marginBottom: 10 }}>
          Marque d&apos;abord des notions !
        </div>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
          Va dans <b>Carte</b> et tape sur un badge pour changer le statut en &quot;Vu&quot;.
        </p>
      </div>
    )
  }

  if (done) return <SessionResult score={score} total={pool.length} onRestart={restart} />

  if (loading || !currQ) {
    return (
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 100 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>⚡</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Génération de la question…</div>
        {currNotion && (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
            {currNotion.dom} · {currNotion.label}
          </div>
        )}
      </div>
    )
  }

  return (
    <QuestionCard
      question={currQ}
      notion={currNotion}
      idx={idx}
      total={pool.length}
      answerStreak={answerStreak}
      shown={shown}
      onShow={() => setShown(true)}
      onAnswer={answer}
    />
  )
}

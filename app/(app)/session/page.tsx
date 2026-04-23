'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { QuestionCard } from '@/components/session/QuestionCard'
import { SessionResult } from '@/components/session/SessionResult'
import { T, QS } from '@/lib/constants'

export default function SessionPage() {
  const { notions, time, handleAnswer, handleComplete } = useGame()

  const [idx,          setIdx]          = useState(0)
  const [shown,        setShown]        = useState(false)
  const [done,         setDone]         = useState(false)
  const [score,        setScore]        = useState({ ok: 0, flou: 0, non: 0 })
  const [answerStreak, setAnswerStreak] = useState(0)

  const avail = QS.filter(q => notions.find(n => n.id === q.nid && n.st !== 'non_vu'))
  const maxQ  = Math.min(avail.length, Math.max(3, Math.floor(time / 5)))
  const pool  = avail.slice(0, maxQ)
  const curr  = pool[idx]
  const notion = curr ? notions.find(n => n.id === curr.nid) : undefined

  const answer = (res: 'ok' | 'flou' | 'non') => {
    const newStreak = res === 'ok' ? answerStreak + 1 : 0
    setAnswerStreak(newStreak)
    setScore(s => ({ ...s, [res]: s[res] + 1 }))
    const xpGain = res === 'ok' ? 30 : res === 'flou' ? 10 : 0
    handleAnswer(curr.nid, res, xpGain, newStreak)
    if (idx + 1 >= pool.length) {
      setDone(true)
      handleComplete(time <= 10)
    } else {
      setIdx(i => i + 1)
      setShown(false)
    }
  }

  const restart = () => {
    setIdx(0)
    setShown(false)
    setDone(false)
    setScore({ ok: 0, flou: 0, non: 0 })
    setAnswerStreak(0)
  }

  if (!avail.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Sora,sans-serif', color: T.text, marginBottom: 10 }}>
          Marque d&apos;abord des notions !
        </div>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
          Va dans <b>Carte</b> et tape sur un badge de notion pour changer son statut en &quot;Vu&quot;.
        </p>
      </div>
    )
  }

  if (done) {
    return <SessionResult score={score} total={pool.length} onRestart={restart} />
  }

  if (!curr) return null

  return (
    <QuestionCard
      question={curr}
      notion={notion}
      idx={idx}
      total={pool.length}
      answerStreak={answerStreak}
      shown={shown}
      onShow={() => setShown(true)}
      onAnswer={answer}
    />
  )
}

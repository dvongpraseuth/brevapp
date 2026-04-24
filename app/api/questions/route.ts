import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { QS } from '@/lib/constants'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SUBJECT_NAMES: Record<string, string> = {
  maths:    'Mathématiques',
  francais: 'Français',
  histoire: 'Histoire-Géographie',
  sciences: 'Sciences (Physique-Chimie et SVT)',
}

export async function POST(req: Request) {
  const { notionId, notionLabel, domain, subject } = await req.json()

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: 'Tu es un professeur de 3ème expert en préparation au brevet DNB 2026. Tu génères des questions de révision concises et précises au format JSON.',
      }, {
        role: 'user',
        content: `Génère 1 question de révision flash pour un élève de 3ème préparant le brevet DNB 2026.

Matière : ${SUBJECT_NAMES[subject] ?? subject}
Domaine : ${domain}
Notion : ${notionLabel}

Réponds en JSON avec exactement ces 3 clés :
{
  "question": "Question courte et précise (2-3 lignes max, niveau brevet)",
  "reponse": "Réponse claire avec la méthode ou les étapes clés",
  "conseil": "Astuce mnémotechnique ou piège fréquent à éviter"
}`,
      }],
    })

    const text = response.choices[0]?.message?.content ?? '{}'
    const data = JSON.parse(text)
    return NextResponse.json({ ...data, notionId })

  } catch (error) {
    console.error('Groq question generation error:', error)

    // Fallback : question statique sur la même notion si disponible
    const fallback = QS.find(q => q.nid === notionId)
    if (fallback) {
      return NextResponse.json({
        notionId: fallback.nid,
        question: fallback.q,
        reponse: fallback.a,
        conseil: '',
      })
    }

    return NextResponse.json({ error: 'Génération impossible' }, { status: 500 })
  }
}

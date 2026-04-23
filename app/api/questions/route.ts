import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { notionId, notionLabel, domain, subject } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Tu es un professeur de 3ème expert en préparation au brevet DNB 2026.

Génère 1 question de révision flash sur la notion suivante :
- Matière : ${subject}
- Domaine : ${domain}
- Notion : ${notionLabel}

Réponds UNIQUEMENT en JSON valide, sans markdown :
{
  "question": "Question courte et précise (2-3 lignes max)",
  "reponse": "Réponse claire avec la méthode si applicable",
  "conseil": "Astuce mnémotechnique ou piège fréquent à éviter"
}

La question doit être du niveau brevet — pas trop facile, pas trop difficile.`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const data = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ ...data, notionId })

  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json({ error: 'Génération impossible' }, { status: 500 })
  }
}

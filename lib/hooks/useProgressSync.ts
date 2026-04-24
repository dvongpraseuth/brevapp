'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notion } from '@/lib/types'

export function useProgressSync(
  notions: Notion[],
  onLoad: (updates: Record<string, Notion['st']>) => void,
) {
  const supabase = createClient()

  // Charger la progression au montage
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      fetch('/api/progress')
        .then(r => r.json())
        .then((rows: Array<{ notion_id: string; status: Notion['st'] }>) => {
          const updates: Record<string, Notion['st']> = {}
          rows.forEach(row => { updates[row.notion_id] = row.status })
          onLoad(updates)
        })
        .catch(() => {}) // silencieux — fallback sur les données locales
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder un changement de statut
  const syncStatus = useCallback((notionId: string, subject: string, status: Notion['st']) => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notion_id: notionId, subject, status }),
    }).catch(() => {}) // silencieux — l'app continue de fonctionner offline
  }, [])

  return { syncStatus }
}

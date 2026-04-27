import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { rewardId, approved } = await req.json()
    if (typeof rewardId !== 'string' || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est bien parent et récupérer son enfant
    const { data: parent } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', user.id)
      .single()

    if (parent?.role !== 'parent') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { data: child } = await supabase
      .from('profiles')
      .select('id')
      .eq('parent_id', user.id)
      .single()

    if (!child) return NextResponse.json({ error: 'Enfant introuvable' }, { status: 404 })

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updateData = approved
      ? { approved: true, approved_at: new Date().toISOString() }
      : { requested: false, approved: false, approved_at: null }

    const { error } = await admin
      .from('rewards')
      .update(updateData)
      .eq('id', rewardId)
      .eq('user_id', child.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST { childEmail } → set current user as parent + link child
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { childEmail } = await req.json()
    if (!childEmail) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    // Trouver l'enfant par email dans auth.users (via service role)
    // On passe par les profils — l'email est dans auth.users, pas dans profiles
    // On utilise admin.listUsers pour trouver l'enfant
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: { users } } = await admin.auth.admin.listUsers()
    const child = users.find(u => u.email === childEmail.toLowerCase().trim())

    if (!child) {
      return NextResponse.json({ error: 'Aucun compte trouvé avec cet email' }, { status: 404 })
    }
    if (child.id === user.id) {
      return NextResponse.json({ error: 'Tu ne peux pas te lier à toi-même' }, { status: 400 })
    }

    // Mettre à jour le rôle du parent
    await supabase
      .from('profiles')
      .update({ role: 'parent' })
      .eq('id', user.id)

    // Lier l'enfant au parent
    await admin.from('profiles')
      .update({ parent_id: user.id })
      .eq('id', child.id)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

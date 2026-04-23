#!/bin/bash
set -e

echo "🚀 BrevApp — Setup automatique"
echo "================================"

# 1. Vérifier les prérequis
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis"; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "❌ Git requis"; exit 1; }
command -v gh   >/dev/null 2>&1 || { echo "⚠️  gh CLI non installé — tu devras créer le repo GitHub manuellement"; }

# 2. Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# 3. Créer le repo GitHub si gh est dispo
if command -v gh >/dev/null 2>&1; then
  echo ""
  echo "📁 Création du repo GitHub..."
  gh repo create brevapp --private --description "App révision brevet Noah DNB 2026" --confirm 2>/dev/null || echo "⚠️  Repo déjà existant ou erreur — continue..."
fi

# 4. Init git + premier commit
echo ""
echo "📝 Premier commit..."
git init 2>/dev/null || true
git add .
git commit -m "feat: init brevapp — POC complet + infrastructure" --allow-empty

# 5. Configurer le secret ANTHROPIC_API_KEY dans GitHub
if command -v gh >/dev/null 2>&1; then
  echo ""
  echo "🔐 Configuration du secret GitHub pour Claude Code..."
  echo "Entre ta clé Anthropic API (elle ne s'affichera pas) :"
  read -s ANTHROPIC_KEY
  echo "$ANTHROPIC_KEY" | gh secret set ANTHROPIC_API_KEY
  echo "✅ Secret configuré"
fi

# 6. Push
echo ""
echo "⬆️  Push vers GitHub..."
git branch -M main
git remote add origin "https://github.com/$(gh api user --jq .login 2>/dev/null || echo 'TON_COMPTE')/brevapp.git" 2>/dev/null || true
git push -u origin main 2>/dev/null || echo "⚠️  Push manuel requis : git push -u origin main"

echo ""
echo "✅ Setup terminé !"
echo ""
echo "🔧 Prochaines étapes manuelles :"
echo "  1. Créer le projet sur app.supabase.com"
echo "  2. Copier les clés dans .env.local (depuis .env.local.template)"
echo "  3. Exécuter les migrations SQL dans Supabase (dossier supabase/migrations/)"
echo "  4. npm run dev → http://localhost:3000"
echo ""
echo "🤖 Pour dispatcher une tâche à Claude Code :"
echo "  → Ouvre une issue GitHub avec @claude dans le texte"
echo "  → Claude Code lit CLAUDE.md et code en autonomie"

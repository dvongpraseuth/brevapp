import { useState, useEffect, useCallback } from "react";

// ─── DATES ────────────────────────────────────────────────────────────────────
const EXAM = {
  oral:     new Date('2026-05-15'),
  francais: new Date('2026-06-26'),
  histoire: new Date('2026-06-29'),
  maths:    new Date('2026-06-30'),
};
const START    = new Date('2026-04-17');
const TOTAL_D  = (EXAM.maths - START) / 864e5;
const ELAPSED  = Math.min(TOTAL_D, (Date.now() - START) / 864e5);
const daysLeft = (d) => Math.max(0, Math.ceil((d - Date.now()) / 864e5));

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const T = {
  bg:'#F8F7F3', card:'#FFFFFF', border:'#E8E5DC',
  text:'#1C1917', muted:'#78716C', faint:'#D6D3CA',
  ok:  '#15803D', okBg:'#F0FDF4', okBorder:'#BBF7D0',
  wip: '#B45309', wipBg:'#FFFBEB', wipBorder:'#FDE68A',
  seen:'#1D4ED8', seenBg:'#EFF6FF', seenBorder:'#BFDBFE',
  none:'#9CA3AF', noneBg:'#F9FAFB', noneBorder:'#E5E7EB',
  xp:  '#7C3AED', streak:'#EA580C', reward:'#0369A1',
};

const SUBJ = [
  { id:'maths',    e:'📐', label:'Maths',       acc:'#1D4ED8', pts:100 },
  { id:'francais', e:'📖', label:'Français',    acc:'#BE185D', pts:100 },
  { id:'histoire', e:'🌍', label:'Hist.-Géo',   acc:'#B45309', pts:50  },
  { id:'sciences', e:'🔬', label:'Sciences',    acc:'#0F766E', pts:50  },
];

const ST_CFG = {
  non_vu:               { label:'Non vu',   pct:0,    c:T.none,  bg:T.noneBg,  border:T.noneBorder },
  vu_en_cours:          { label:'Vu',       pct:0.33, c:T.seen,  bg:T.seenBg,  border:T.seenBorder },
  en_cours_assimilation:{ label:'En cours', pct:0.66, c:T.wip,   bg:T.wipBg,   border:T.wipBorder  },
  maitrise:             { label:'Maîtrisé', pct:1,    c:T.ok,    bg:T.okBg,    border:T.okBorder   },
};
const ST_CYCLE = ['non_vu','vu_en_cours','en_cours_assimilation','maitrise'];

// ─── GAMIFICATION ─────────────────────────────────────────────────────────────
const LEVELS = [
  {min:0,    name:'Novice',        e:'🌱'},
  {min:150,  name:'Apprenti',      e:'📝'},
  {min:400,  name:'Studieux',      e:'📚'},
  {min:800,  name:'Appliqué',      e:'⚡'},
  {min:1300, name:'Avancé',        e:'🧠'},
  {min:2000, name:'Expert',        e:'🔥'},
  {min:3000, name:'Brevet Ready',  e:'🎯'},
  {min:4500, name:'As du Brevet',  e:'🏆'},
];

const getLevel = (xp) => {
  let lv = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) lv = i;
  return lv;
};
const nextXp = (xp) => {
  const lv = getLevel(xp);
  return lv < LEVELS.length - 1 ? LEVELS[lv + 1].min : 9999;
};

const getNoteEstimee = (notions, subId) => {
  const sn = notions.filter(n => n.sub === subId && n.p === 1);
  if (!sn.length) return 0;
  const score = sn.reduce((acc, n) =>
    acc + (n.st==='maitrise' ? 1 : n.st==='en_cours_assimilation' ? 0.55 : n.st==='vu_en_cours' ? 0.25 : 0), 0);
  return Math.round(score / sn.length * 200) / 10;
};

const noteColor = (n) => n >= 14 ? T.ok : n >= 10 ? T.wip : '#DC2626';

const BADGES = [
  { id:'first',    e:'⚡', name:'1ère session',      check:(g)=> g.sessions >= 1 },
  { id:'streak3',  e:'🔥', name:'3 jours de feu',    check:(g)=> g.streak >= 3 },
  { id:'streak7',  e:'💥', name:'Semaine de feu',    check:(g)=> g.streak >= 7 },
  { id:'sniper',   e:'🎯', name:'Sniper',            check:(g)=> g.bestStreak >= 5 },
  { id:'flash',    e:'⏱️', name:'Flash session',     check:(g)=> g.flashSessions >= 1 },
  { id:'lv3',      e:'📚', name:'Niveau Studieux',   check:(g)=> g.xp >= 400 },
  { id:'lv5',      e:'🧠', name:'Niveau Avancé',     check:(g)=> g.xp >= 1300 },
  { id:'note10m',  e:'📊', name:'Cap des 10 (Maths)',check:(g,n)=> getNoteEstimee(n,'maths') >= 10 },
  { id:'note14m',  e:'🏅', name:'Brevet en vue',     check:(g,n)=> getNoteEstimee(n,'maths') >= 14 },
  { id:'allvum',   e:'👀', name:'Programme Maths vu',check:(g,n)=> n.filter(x=>x.sub==='maths').every(x=>x.st!=='non_vu') },
];

// ─── DONNÉES PROGRAMME (extrait représentatif) ────────────────────────────────
const NOTIONS = [
  // MATHS - Nombres & Calcul
  {id:'m01',sub:'maths',dom:'Nombres & Calcul',label:'Fractions',           p:1,st:'maitrise'},
  {id:'m02',sub:'maths',dom:'Nombres & Calcul',label:'Puissances',          p:1,st:'maitrise'},
  {id:'m03',sub:'maths',dom:'Nombres & Calcul',label:'Notation scientifique',p:1,st:'vu_en_cours'},
  {id:'m04',sub:'maths',dom:'Nombres & Calcul',label:'Racines carrées',     p:1,st:'vu_en_cours'},
  {id:'m05',sub:'maths',dom:'Nombres & Calcul',label:'Distributivité',      p:1,st:'maitrise'},
  {id:'m06',sub:'maths',dom:'Nombres & Calcul',label:'Identité (a+b)²',     p:1,st:'vu_en_cours'},
  {id:'m07',sub:'maths',dom:'Nombres & Calcul',label:'Identité (a-b)²',     p:1,st:'non_vu'},
  {id:'m08',sub:'maths',dom:'Nombres & Calcul',label:'Identité (a+b)(a-b)', p:1,st:'non_vu'},
  {id:'m09',sub:'maths',dom:'Nombres & Calcul',label:'Factorisation',       p:1,st:'en_cours_assimilation'},
  {id:'m10',sub:'maths',dom:'Nombres & Calcul',label:'Équation 1er degré',  p:1,st:'en_cours_assimilation'},
  {id:'m11',sub:'maths',dom:'Nombres & Calcul',label:'Équation produit A×B=0',p:1,st:'non_vu'},
  {id:'m12',sub:'maths',dom:'Nombres & Calcul',label:'Mise en équation',    p:1,st:'non_vu'},
  // MATHS - Fonctions
  {id:'m13',sub:'maths',dom:'Fonctions',        label:'Image & antécédent',  p:1,st:'vu_en_cours'},
  {id:'m14',sub:'maths',dom:'Fonctions',        label:'Tableau de valeurs',  p:1,st:'maitrise'},
  {id:'m15',sub:'maths',dom:'Fonctions',        label:'Fonction affine ax+b',p:1,st:'non_vu'},
  {id:'m16',sub:'maths',dom:'Fonctions',        label:'Lire un graphe',      p:1,st:'maitrise'},
  {id:'m17',sub:'maths',dom:'Fonctions',        label:'Pourcentages',        p:1,st:'maitrise'},
  // MATHS - Probabilités
  {id:'m18',sub:'maths',dom:'Probabilités',     label:'Notion de probabilité',p:1,st:'maitrise'},
  {id:'m19',sub:'maths',dom:'Probabilités',     label:'Calcul de probabilité',p:1,st:'maitrise'},
  {id:'m20',sub:'maths',dom:'Probabilités',     label:'Arbre de probabilités',p:1,st:'vu_en_cours'},
  {id:'m21',sub:'maths',dom:'Probabilités',     label:'Tableau croisé',      p:1,st:'non_vu'},
  {id:'m22',sub:'maths',dom:'Statistiques',     label:'Moyenne & médiane',   p:1,st:'maitrise'},
  // MATHS - Géométrie
  {id:'m23',sub:'maths',dom:'Géométrie',        label:'Thalès — énoncé',     p:1,st:'vu_en_cours'},
  {id:'m24',sub:'maths',dom:'Géométrie',        label:'Thalès — longueur',   p:1,st:'en_cours_assimilation'},
  {id:'m25',sub:'maths',dom:'Géométrie',        label:'Réciproque Thalès',   p:1,st:'non_vu'},
  {id:'m26',sub:'maths',dom:'Géométrie',        label:'Trigo — cos/sin/tan', p:1,st:'vu_en_cours'},
  {id:'m27',sub:'maths',dom:'Géométrie',        label:'Trigo — longueur',    p:1,st:'non_vu'},
  {id:'m28',sub:'maths',dom:'Géométrie',        label:'Trigo — angle',       p:1,st:'non_vu'},
  {id:'m29',sub:'maths',dom:'Géométrie',        label:'Pythagore',           p:1,st:'maitrise'},
  {id:'m30',sub:'maths',dom:'Géométrie',        label:'Réciproque Pythagore',p:1,st:'vu_en_cours'},
  {id:'m31',sub:'maths',dom:'Géométrie',        label:'Volumes solides',     p:1,st:'non_vu'},
  // MATHS - Algo
  {id:'m32',sub:'maths',dom:'Algorithmique',    label:'Variables & conditions',p:1,st:'non_vu'},
  {id:'m33',sub:'maths',dom:'Algorithmique',    label:'Boucles',             p:1,st:'non_vu'},
  {id:'m34',sub:'maths',dom:'Algorithmique',    label:'Lire un algorithme',  p:1,st:'non_vu'},
  // FRANÇAIS
  {id:'f01',sub:'francais',dom:'Lecture',       label:'Comprendre un texte', p:1,st:'vu_en_cours'},
  {id:'f02',sub:'francais',dom:'Lecture',       label:'Narrateur & point de vue',p:1,st:'en_cours_assimilation'},
  {id:'f03',sub:'francais',dom:'Lecture',       label:'Procédés stylistiques',p:1,st:'non_vu'},
  {id:'f04',sub:'francais',dom:'Lecture',       label:'Texte argumentatif',  p:1,st:'non_vu'},
  {id:'f05',sub:'francais',dom:'Grammaire',     label:'Fonctions grammaticales',p:1,st:'maitrise'},
  {id:'f06',sub:'francais',dom:'Grammaire',     label:'Subordonnée relative',p:1,st:'vu_en_cours'},
  {id:'f07',sub:'francais',dom:'Grammaire',     label:'Subordonnée complétive',p:1,st:'non_vu'},
  {id:'f08',sub:'francais',dom:'Grammaire',     label:'Discours direct/indirect',p:1,st:'non_vu'},
  {id:'f09',sub:'francais',dom:'Orthographe',   label:'Accord sujet-verbe',  p:1,st:'maitrise'},
  {id:'f10',sub:'francais',dom:'Orthographe',   label:'Accord participe passé',p:1,st:'non_vu'},
  {id:'f11',sub:'francais',dom:'Orthographe',   label:'Subjonctif présent',  p:1,st:'non_vu'},
  {id:'f12',sub:'francais',dom:'Rédaction',     label:'Texte narratif',      p:1,st:'en_cours_assimilation'},
  {id:'f13',sub:'francais',dom:'Rédaction',     label:'Paragraphe argumenté',p:1,st:'non_vu'},
  {id:'f14',sub:'francais',dom:'Rédaction',     label:'Réécrire un texte',   p:1,st:'non_vu'},
  // HISTOIRE
  {id:'h01',sub:'histoire',dom:'Histoire',      label:'1ère Guerre mondiale', p:1,st:'maitrise'},
  {id:'h02',sub:'histoire',dom:'Histoire',      label:'Régimes totalitaires', p:1,st:'maitrise'},
  {id:'h03',sub:'histoire',dom:'Histoire',      label:'2e Guerre mondiale',   p:1,st:'vu_en_cours'},
  {id:'h04',sub:'histoire',dom:'Histoire',      label:'Vichy & collaboration',p:1,st:'non_vu'},
  {id:'h05',sub:'histoire',dom:'Histoire',      label:'Guerre Froide',        p:1,st:'non_vu'},
  {id:'h06',sub:'histoire',dom:'Histoire',      label:'Décolonisation',       p:1,st:'non_vu'},
  {id:'h07',sub:'histoire',dom:'Géographie',    label:'Mondialisation',       p:1,st:'non_vu'},
  {id:'h08',sub:'histoire',dom:'Géographie',    label:'Espaces urbains',      p:1,st:'vu_en_cours'},
  {id:'h09',sub:'histoire',dom:'Géographie',    label:'Inégalités mondiales', p:1,st:'non_vu'},
  {id:'h10',sub:'histoire',dom:'EMC',           label:'Institutions françaises',p:1,st:'non_vu'},
  {id:'h11',sub:'histoire',dom:'EMC',           label:'Droits fondamentaux',  p:1,st:'vu_en_cours'},
  // SCIENCES
  {id:'s01',sub:'sciences',dom:'Physique',      label:'Forces & mouvements',  p:1,st:'non_vu'},
  {id:'s02',sub:'sciences',dom:'Physique',      label:'Circuits électriques', p:1,st:'non_vu'},
  {id:'s03',sub:'sciences',dom:'Physique',      label:'Loi d\'Ohm',           p:1,st:'non_vu'},
  {id:'s04',sub:'sciences',dom:'Chimie',        label:'Réactions chimiques',  p:1,st:'non_vu'},
  {id:'s05',sub:'sciences',dom:'Chimie',        label:'Acides et bases',      p:1,st:'non_vu'},
  {id:'s06',sub:'sciences',dom:'SVT',           label:'ADN & génétique',      p:1,st:'vu_en_cours'},
  {id:'s07',sub:'sciences',dom:'SVT',           label:'Hérédité',             p:1,st:'non_vu'},
  {id:'s08',sub:'sciences',dom:'SVT',           label:'Évolution & sélection',p:1,st:'non_vu'},
  {id:'s09',sub:'sciences',dom:'SVT',           label:'Système immunitaire',  p:1,st:'non_vu'},
  {id:'s10',sub:'sciences',dom:'SVT',           label:'Écosystèmes',          p:1,st:'non_vu'},
];

const QS = [
  {id:'q1', nid:'m26', q:'Comment calcule-t-on cos(A)\ndans un triangle rectangle ?',     a:'cos(A) = côté adjacent / hypoténuse\n\n💡 SOH-CAH-TOA\nSin=Opp/Hyp · Cos=Adj/Hyp · Tan=Opp/Adj'},
  {id:'q2', nid:'m06', q:'Développe (a + b)²',                                             a:'a² + 2ab + b²\n\nEx : (x+3)² = x²+6x+9'},
  {id:'q3', nid:'m09', q:'Factorise : 6x² + 4x',                                          a:'2x(3x + 2)\nFacteur commun = 2x'},
  {id:'q4', nid:'m23', q:'Complète le théorème de Thalès :\nSi MN // BC, AM/AB = … = …', a:'AM/AB = AN/AC = MN/BC'},
  {id:'q5', nid:'m20', q:'3 rouges + 2 bleues, sans remise.\nP(tirer 2 rouges) = ?',      a:'3/5 × 2/4 = 6/20 = 3/10\nOn multiplie les branches de l\'arbre'},
  {id:'q6', nid:'m29', q:'Cathètes = 3 et 4.\nCalcule l\'hypoténuse.',                    a:'h² = 9+16 = 25\nh = 5 🔥 Triple 3-4-5'},
  {id:'q7', nid:'m10', q:'Résous : 3x − 5 = 7 + x',                                      a:'2x = 12\nx = 6'},
  {id:'q8', nid:'m13', q:'f(x) = 2x² − 3\nImage de 4 ? Antécédent de 29 ?',             a:'f(4) = 29\nAntécédent : x² = 16 → x = ±4'},
  {id:'q9', nid:'f06', q:'Quelle est la fonction de la\nsubordonnée relative ?',           a:'Complément du nom (antécédent)\nIntroduite par qui, que, dont, où\n\nEx : "Le livre que je lis" → que je lis = subordonnée relative'},
  {id:'q10',nid:'h01',q:'Cite 2 causes directes\nde la 1ère Guerre mondiale.',             a:'1. Assassinat de François-Ferdinand (28 juin 1914)\n2. Jeu des alliances — engrenage automatique'},
  {id:'q11',nid:'h02',q:'Cite 2 traits communs\ndes régimes totalitaires.',                a:'1. Parti unique + culte du chef\n2. Propagande + terreur d\'État'},
  {id:'q12',nid:'s06',q:'Qu\'est-ce qu\'un gène ?',                                       a:'Séquence d\'ADN portant l\'information\npour la synthèse d\'une protéine\n\nLocalisé sur un chromosome'},
  {id:'q13',nid:'f09',q:'Accord sujet-verbe :\n"L\'ensemble des élèves … parti(s)"',      a:'"est parti" (accord avec "l\'ensemble", singulier)\n\nSi on insiste sur les élèves : "sont partis" (acceptable)'},
  {id:'q14',nid:'m17',q:'Un prix passe de 80€ à 96€.\nCalcule le taux d\'augmentation.',  a:'(96-80)/80 × 100 = 20%\nCoefficient multiplicateur = 96/80 = 1,2'},
];

// ─── REWARD SYSTEM ────────────────────────────────────────────────────────────
const INIT_REWARDS = [
  {id:'r1', label:'🎮 Manette PS5',     cost:5000, unlocked:false, requested:false},
  {id:'r2', label:'🎬 Ciné + McDo',     cost:2500, unlocked:false, requested:false},
  {id:'r3', label:'👟 Nouvelles baskets',cost:4000, unlocked:false, requested:false},
  {id:'r4', label:'🏖️ Week-end choisi', cost:6000, unlocked:false, requested:false},
];

const MILESTONES = [
  {xp:500,   euros:5,  label:'Bon départ 🥉'},
  {xp:1500,  euros:15, label:'Sérieux 🥈'},
  {xp:3000,  euros:30, label:'Engagé 🥇'},
  {xp:5000,  euros:50, label:'Brevet Ready 🏆'},
];

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────
function Ring({st, size=16}) {
  const cfg = ST_CFG[st];
  const r = (size-3)/2, mid = size/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0,display:'block'}}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={T.border} strokeWidth="2"/>
      {cfg.pct > 0 && (
        <circle cx={mid} cy={mid} r={r} fill="none" stroke={cfg.c} strokeWidth="2.5"
          strokeDasharray={`${cfg.pct*circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${mid} ${mid})`}/>
      )}
      {st==='maitrise' && <circle cx={mid} cy={mid} r={3} fill={cfg.c}/>}
    </svg>
  );
}

function StatusBadge({st, onClick}) {
  const cfg = ST_CFG[st];
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:5,
      background:cfg.bg, border:`1.5px solid ${cfg.border}`,
      borderRadius:20, padding:'3px 9px 3px 6px', cursor:onClick?'pointer':'default',
      flexShrink:0, transition:'all .15s',
    }}>
      <Ring st={st} size={11}/>
      <span style={{fontSize:10, fontWeight:700, color:cfg.c, whiteSpace:'nowrap'}}>{cfg.label}</span>
    </button>
  );
}

function Card({children, style={}}) {
  return <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:14, ...style}}>{children}</div>;
}

function XpBar({xp}) {
  const lv   = getLevel(xp);
  const lvl  = LEVELS[lv];
  const next = nextXp(xp);
  const prev = lvl.min;
  const pct  = Math.round((xp-prev)/(next-prev)*100);
  return (
    <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'12px 14px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontSize:18}}>{lvl.e}</span>
          <div>
            <div style={{fontSize:12, fontWeight:800, color:T.text, fontFamily:'Sora,sans-serif'}}>{lvl.name}</div>
            <div style={{fontSize:10, color:T.muted}}>Niveau {lv+1}</div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:16, fontWeight:900, color:T.xp, fontFamily:'Sora,sans-serif'}}>{xp} XP</div>
          <div style={{fontSize:10, color:T.muted}}>→ {next} XP</div>
        </div>
      </div>
      <div style={{background:T.border, borderRadius:999, height:7, overflow:'hidden'}}>
        <div style={{height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${T.xp},#A855F7)`,
          borderRadius:999, transition:'width .5s ease'}}/>
      </div>
      <div style={{fontSize:10, color:T.muted, marginTop:4, textAlign:'right'}}>{pct}% vers niveau {lv+2}</div>
    </div>
  );
}

function DomainTree({dom, notions, onCycle}) {
  const [open, setOpen] = useState(true);
  const ok = notions.filter(n=>n.st==='maitrise').length;
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:8,
        background:'none', border:'none', cursor:'pointer', padding:'10px 0', textAlign:'left',
      }}>
        <span style={{fontSize:9, color:T.muted, transform:open?'rotate(90deg)':'none', transition:'transform .2s', display:'inline-block', width:10}}>▶</span>
        <span style={{flex:1, fontSize:12, fontWeight:700, color:T.text}}>{dom}</span>
        <div style={{display:'flex', gap:3, alignItems:'center'}}>
          {notions.map(n=>(
            <div key={n.id} style={{width:5, height:5, borderRadius:'50%',
              background:n.st==='maitrise'?T.ok:n.st==='en_cours_assimilation'?T.wip:n.st==='vu_en_cours'?T.seen:T.faint}}/>
          ))}
          <span style={{fontSize:10, color:T.muted, marginLeft:4, minWidth:24, textAlign:'right'}}>{ok}/{notions.length}</span>
        </div>
      </button>
      {open && (
        <div style={{marginLeft:18, borderLeft:`2px solid ${T.border}`, marginBottom:4}}>
          {notions.map((n,i)=>{
            const isLast = i===notions.length-1;
            return (
              <div key={n.id} style={{display:'flex', alignItems:'center', position:'relative', paddingLeft:14}}>
                <div style={{position:'absolute', left:0, top:'50%', width:10, height:1.5, background:T.faint, transform:'translateY(-50%)'}}/>
                <div style={{flex:1, display:'flex', alignItems:'center', gap:8, padding:'8px 0',
                  borderBottom:isLast?'none':`1px solid ${T.border}30`}}>
                  {n.p===1 && <span style={{fontSize:8, flexShrink:0, opacity:.5}}>🔴</span>}
                  <span style={{flex:1, fontSize:12, color:n.st==='maitrise'?T.muted:T.text,
                    textDecoration:n.st==='maitrise'?'line-through':'none', transition:'all .2s'}}>{n.label}</span>
                  <StatusBadge st={n.st} onClick={()=>onCycle(n.id)}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TOAST XP ─────────────────────────────────────────────────────────────────
function XpToast({gain, onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,1800);return()=>clearTimeout(t);},[]);
  return (
    <div style={{
      position:'fixed', top:70, left:'50%', transform:'translateX(-50%)',
      background:T.xp, color:'#FFF', borderRadius:99, padding:'8px 20px',
      fontSize:14, fontWeight:800, fontFamily:'Sora,sans-serif',
      zIndex:999, boxShadow:'0 4px 20px rgba(124,58,237,.4)',
      animation:'slideDown .3s ease',
    }}>+{gain} XP ⚡</div>
  );
}

// ─── ONGLET HOME ──────────────────────────────────────────────────────────────
function HomeTab({notions, game, time, setTime, subject, setSubject, onStart, rewards}) {
  const jj    = daysLeft(EXAM.maths);
  const mn    = notions.filter(n=>n.sub==='maths');
  const ok    = mn.filter(n=>n.st==='maitrise').length;
  const seen  = mn.filter(n=>n.st!=='non_vu').length;
  const noteMaths = getNoteEstimee(notions,'maths');
  const urgent = notions.filter(n=>n.p===1&&n.st==='non_vu').slice(0,3);
  const nextMilestone = MILESTONES.find(m=>m.xp>game.xp);
  const earnedCoins   = MILESTONES.filter(m=>m.xp<=game.xp).reduce((acc,m)=>acc+m.euros,0);

  return (
    <div style={{padding:'16px 14px 110px'}}>
      {/* Header */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:12, color:T.muted}}>Bonjour Noah 👋</div>
        <div style={{fontSize:26, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.text, letterSpacing:-1, lineHeight:1.1, marginTop:3}}>
          J-{jj} avant les Maths
        </div>
        <div style={{fontSize:11, color:T.muted, marginTop:2}}>Brevet du 26 au 30 juin 2026</div>
      </div>

      {/* Streak + XP */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <Card style={{padding:'12px 14px', borderTop:`3px solid ${T.streak}`}}>
          <div style={{fontSize:24}}>{game.streak>=3?'🔥':'⏳'}</div>
          <div style={{fontSize:22, fontWeight:900, color:T.streak, fontFamily:'Sora,sans-serif'}}>{game.streak}</div>
          <div style={{fontSize:10, color:T.muted}}>jour{game.streak>1?'s':''} de streak</div>
        </Card>
        <Card style={{padding:'12px 14px', borderTop:`3px solid ${T.xp}`}}>
          <div style={{fontSize:24}}>⚡</div>
          <div style={{fontSize:22, fontWeight:900, color:T.xp, fontFamily:'Sora,sans-serif'}}>{game.xp}</div>
          <div style={{fontSize:10, color:T.muted}}>XP total</div>
        </Card>
      </div>

      <XpBar xp={game.xp}/>

      {/* Note simulée */}
      <Card style={{marginTop:10, padding:'14px', borderLeft:`4px solid ${noteColor(noteMaths)}`}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:1}}>Note simulée Maths</div>
            <div style={{fontSize:32, fontWeight:900, fontFamily:'Sora,sans-serif', color:noteColor(noteMaths), lineHeight:1, marginTop:4}}>
              {noteMaths.toFixed(1)}<span style={{fontSize:16, color:T.muted}}>/20</span>
            </div>
            <div style={{fontSize:10, color:T.muted, marginTop:3}}>
              {noteMaths>=14?'🏅 En route pour la mention !':noteMaths>=10?'💪 Continue, tu y es presque':'📚 Encore du boulot !'}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            {SUBJ.map(s=>{
              const n = getNoteEstimee(notions,s.id);
              return (
                <div key={s.id} style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                  <span style={{fontSize:11}}>{s.e}</span>
                  <div style={{width:50, background:T.border, borderRadius:999, height:5}}>
                    <div style={{height:'100%', width:`${n/20*100}%`, background:s.acc, borderRadius:999}}/>
                  </div>
                  <span style={{fontSize:10, fontWeight:700, color:s.acc, minWidth:28}}>{n.toFixed(0)}/20</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Objectif reward */}
      {nextMilestone && (
        <Card style={{marginTop:10, padding:'12px 14px', background:'#EFF6FF', border:`1px solid #BFDBFE`}}>
          <div style={{fontSize:11, fontWeight:700, color:T.reward, marginBottom:6}}>💰 Prochain palier — {nextMilestone.label}</div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
            <span style={{fontSize:12, color:T.text}}>{game.xp} / {nextMilestone.xp} XP</span>
            <span style={{fontSize:14, fontWeight:900, color:T.reward, fontFamily:'Sora,sans-serif'}}>+{nextMilestone.euros}€</span>
          </div>
          <div style={{background:T.seenBorder, borderRadius:999, height:7}}>
            <div style={{height:'100%', width:`${Math.min(100,game.xp/nextMilestone.xp*100)}%`,
              background:T.reward, borderRadius:999, transition:'width .4s'}}/>
          </div>
          <div style={{fontSize:10, color:T.muted, marginTop:4}}>{earnedCoins}€ déjà débloqués 🎉</div>
        </Card>
      )}

      {/* Urgent */}
      {urgent.length>0 && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8}}>⚡ Priorité — pas encore vu</div>
          {urgent.map(n=>(
            <div key={n.id} style={{display:'flex', alignItems:'center', gap:10,
              background:T.wipBg, border:`1px solid ${T.wipBorder}`, borderRadius:10,
              padding:'9px 12px', marginBottom:6}}>
              <Ring st={n.st} size={12}/>
              <span style={{flex:1, fontSize:12, color:T.text, fontWeight:600}}>{n.label}</span>
              <span style={{fontSize:10, color:T.muted}}>{n.dom}</span>
            </div>
          ))}
        </div>
      )}

      {/* Temps */}
      <div style={{marginTop:14, marginBottom:10}}>
        <div style={{fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8}}>⏱ Temps disponible</div>
        <div style={{display:'flex', gap:6}}>
          {[10,20,30,45].map(t=>(
            <button key={t} onClick={()=>setTime(t)} style={{
              flex:1, padding:'11px 0', borderRadius:10, cursor:'pointer',
              border:`2px solid ${time===t?T.text:T.border}`,
              background:time===t?T.text:T.card,
              color:time===t?'#FFF':T.muted,
              fontSize:13, fontWeight:700, fontFamily:'Sora,sans-serif', transition:'all .15s',
            }}>{t}m</button>
          ))}
        </div>
      </div>

      {/* Matière */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8}}>📚 Matière</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {SUBJ.map(s=>(
            <button key={s.id} onClick={()=>setSubject(s.id)} style={{
              padding:'7px 12px', borderRadius:8, cursor:'pointer',
              border:`2px solid ${subject===s.id?s.acc:T.border}`,
              background:subject===s.id?s.acc:T.card,
              color:subject===s.id?'#FFF':T.text,
              fontSize:12, fontWeight:600, transition:'all .15s',
            }}>{s.e} {s.label}</button>
          ))}
        </div>
      </div>

      <button onClick={onStart} style={{
        width:'100%', padding:16, borderRadius:12, border:'none',
        background:T.text, color:'#FFF', fontSize:15, fontWeight:800,
        cursor:'pointer', fontFamily:'Sora,sans-serif', letterSpacing:.3,
      }}>Lancer · {time} min →</button>
    </div>
  );
}

// ─── ONGLET CARTE ─────────────────────────────────────────────────────────────
function CarteTab({notions, onCycle}) {
  const [sub, setSub] = useState('maths');
  const subj = SUBJ.find(s=>s.id===sub);
  const sn   = notions.filter(n=>n.sub===sub);
  const doms = [...new Set(sn.map(n=>n.dom))];
  const ok   = sn.filter(n=>n.st==='maitrise').length;
  const pct  = sn.length ? Math.round(ok/sn.length*100) : 0;
  const note = getNoteEstimee(notions, sub);

  return (
    <div style={{padding:'16px 14px 110px'}}>
      <div style={{fontSize:18, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.text, marginBottom:14}}>
        Carte des compétences
      </div>

      {/* Sélecteur */}
      <div style={{display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4}}>
        {SUBJ.map(s=>{
          const n = getNoteEstimee(notions,s.id);
          return (
            <button key={s.id} onClick={()=>setSub(s.id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:1,
              padding:'7px 10px', borderRadius:10, cursor:'pointer', flexShrink:0,
              border:`2px solid ${sub===s.id?s.acc:T.border}`,
              background:sub===s.id?s.acc:T.card,
              color:sub===s.id?'#FFF':T.text,
            }}>
              <span style={{fontSize:12, fontWeight:700}}>{s.e} {s.label}</span>
              <span style={{fontSize:10, opacity:.8}}>{n.toFixed(0)}/20</span>
            </button>
          );
        })}
      </div>

      {/* Stats matière */}
      <Card style={{padding:'12px 14px', borderTop:`3px solid ${subj?.acc}`, marginBottom:10}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <div>
            <div style={{fontSize:12, fontWeight:700, color:T.text}}>{subj?.label}</div>
            <div style={{fontSize:10, color:T.muted}}>{ok}/{sn.length} maîtrisées</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:24, fontWeight:900, fontFamily:'Sora,sans-serif', color:subj?.acc}}>{pct}%</div>
            <div style={{fontSize:11, fontWeight:700, color:noteColor(note)}}>≈ {note.toFixed(1)}/20 brevet</div>
          </div>
        </div>
        <div style={{background:T.border, borderRadius:999, height:8}}>
          <div style={{height:'100%', width:`${pct}%`, background:subj?.acc, borderRadius:999, transition:'width .4s'}}/>
        </div>
        <div style={{display:'flex', gap:12, marginTop:8, flexWrap:'wrap'}}>
          {[['Maîtrisé',T.ok],['En cours',T.wip],['Vu',T.seen],['Non vu',T.none]].map(([l,c])=>(
            <div key={l} style={{display:'flex', alignItems:'center', gap:4}}>
              <div style={{width:7, height:7, borderRadius:'50%', background:c}}/>
              <span style={{fontSize:10, color:T.muted}}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      <p style={{fontSize:10, color:T.faint, textAlign:'center', marginBottom:10}}>
        Tape un badge pour faire avancer son statut
      </p>

      {/* Arborescence */}
      <Card style={{padding:'4px 14px 10px'}}>
        {doms.map((dom,i)=>(
          <div key={dom}>
            <DomainTree dom={dom} notions={sn.filter(n=>n.dom===dom)} onCycle={onCycle}/>
            {i<doms.length-1 && <div style={{height:1, background:T.border, marginLeft:18}}/>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── ONGLET SESSION ───────────────────────────────────────────────────────────
function SessionTab({notions, time, onAnswer, onComplete}) {
  const [idx,   setIdx]   = useState(0);
  const [shown, setShown] = useState(false);
  const [done,  setDone]  = useState(false);
  const [score, setScore] = useState({ok:0,flou:0,non:0});
  const [answerStreak, setAnswerStreak] = useState(0);

  const avail = QS.filter(q=>notions.find(n=>n.id===q.nid&&n.st!=='non_vu'));
  const maxQ  = Math.min(avail.length, Math.max(3, Math.floor(time/5)));
  const pool  = avail.slice(0,maxQ);
  const curr  = pool[idx];
  const notion= curr ? notions.find(n=>n.id===curr.nid) : null;

  const answer = (res) => {
    const newStreak = res==='ok' ? answerStreak+1 : 0;
    setAnswerStreak(newStreak);
    setScore(s=>({...s,[res]:s[res]+1}));
    const xpGain = res==='ok' ? 30 : res==='flou' ? 10 : 0;
    onAnswer(curr.nid, res, xpGain, newStreak);
    if (idx+1 >= pool.length) { setDone(true); onComplete(time<=10); }
    else { setIdx(i=>i+1); setShown(false); }
  };

  const restart = () => { setIdx(0); setShown(false); setDone(false); setScore({ok:0,flou:0,non:0}); setAnswerStreak(0); };

  if (!avail.length) return (
    <div style={{padding:24, textAlign:'center', paddingTop:80}}>
      <div style={{fontSize:48, marginBottom:16}}>🎯</div>
      <div style={{fontSize:17, fontWeight:800, fontFamily:'Sora,sans-serif', color:T.text, marginBottom:10}}>
        Marque d'abord des notions !
      </div>
      <p style={{fontSize:13, color:T.muted, lineHeight:1.7}}>
        Va dans <b>Carte</b> et tape sur un badge de notion pour changer son statut en "Vu".
      </p>
    </div>
  );

  if (done) {
    const tot   = pool.length;
    const pctOk = Math.round(score.ok/tot*100);
    const xpEarned = score.ok*30 + score.flou*10 + 50;
    return (
      <div style={{padding:'24px 14px 110px', textAlign:'center'}}>
        <div style={{fontSize:52, marginBottom:12}}>{pctOk>=80?'🔥':pctOk>=50?'💪':'📚'}</div>
        <div style={{fontSize:28, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.text}}>{pctOk}%</div>
        <div style={{fontSize:13, color:T.muted, marginBottom:20}}>
          {pctOk>=80?'Excellent !':pctOk>=50?'Continue comme ça !':'Revois ces notions demain.'}
        </div>
        <Card style={{padding:'14px 20px', marginBottom:14, display:'flex', justifyContent:'space-around'}}>
          {[[score.ok,T.ok,'✅ Su'],[score.flou,T.wip,'🤔 Flou'],[score.non,T.none,'❌ Pas su']].map(([v,c,l])=>(
            <div key={l}>
              <div style={{fontSize:26, fontWeight:900, color:c, fontFamily:'Sora,sans-serif'}}>{v}</div>
              <div style={{fontSize:11, color:T.muted}}>{l}</div>
            </div>
          ))}
        </Card>
        <div style={{background:'#F5F3FF', border:'1px solid #DDD6FE', borderRadius:12, padding:'12px 16px', marginBottom:16}}>
          <div style={{fontSize:16, fontWeight:900, color:T.xp, fontFamily:'Sora,sans-serif'}}>+{xpEarned} XP gagnés ⚡</div>
          <div style={{fontSize:11, color:'#6D28D9'}}>Session complète +50 · Su ×{score.ok} · Flou ×{score.flou}</div>
        </div>
        <button onClick={restart} style={{
          width:'100%', padding:14, borderRadius:12, border:`1.5px solid ${T.border}`,
          background:T.card, color:T.text, fontSize:14, fontWeight:700, cursor:'pointer',
        }}>Recommencer</button>
      </div>
    );
  }

  if (!curr) return null;
  return (
    <div style={{padding:'16px 14px 110px'}}>
      {/* Progress */}
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
        <div style={{flex:1, background:T.border, borderRadius:999, height:5}}>
          <div style={{height:'100%', width:`${idx/pool.length*100}%`, background:T.text, borderRadius:999, transition:'width .3s'}}/>
        </div>
        <span style={{fontSize:11, color:T.muted, flexShrink:0}}>{idx+1}/{pool.length}</span>
        {answerStreak>=3 && <span style={{fontSize:12}}>🔥{answerStreak}</span>}
      </div>

      {notion && (
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:12}}>
          <Ring st={notion.st} size={12}/>
          <span style={{fontSize:11, color:T.muted}}>{notion.dom} · {notion.label}</span>
        </div>
      )}

      <Card style={{padding:22, minHeight:210, marginBottom:14, borderTop:`3px solid ${T.text}`}}>
        <div style={{fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:1.2, marginBottom:12}}>Question</div>
        <div style={{fontSize:17, fontWeight:700, fontFamily:'Sora,sans-serif', color:T.text, lineHeight:1.55, whiteSpace:'pre-line'}}>
          {curr.q}
        </div>
        {shown && (
          <div style={{marginTop:18, paddingTop:18, borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:10, color:T.ok, textTransform:'uppercase', letterSpacing:1.2, marginBottom:10}}>✓ Réponse</div>
            <div style={{fontSize:14, color:T.text, whiteSpace:'pre-line', lineHeight:1.7, fontFamily:'Sora,sans-serif'}}>{curr.a}</div>
          </div>
        )}
      </Card>

      {!shown ? (
        <button onClick={()=>setShown(true)} style={{
          width:'100%', padding:14, borderRadius:12, border:`2px solid ${T.border}`,
          background:T.card, color:T.text, fontSize:14, fontWeight:700, cursor:'pointer',
        }}>Voir la réponse</button>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
          {[['non','#FEF2F2','#DC2626','#991B1B','❌ Pas su'],
            ['flou','#FFFBEB','#D97706','#92400E','🤔 Flou'],
            ['ok','#F0FDF4','#16A34A','#166534','✅ Su !']].map(([k,bg,brd_c,tc,l])=>(
            <button key={k} onClick={()=>answer(k)} style={{
              padding:'12px 6px', borderRadius:12,
              border:`2px solid ${brd_c}40`, background:bg,
              color:tc, fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'Sora,sans-serif',
            }}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ONGLET BREVET ────────────────────────────────────────────────────────────
function BrevetTab({notions, game}) {
  const epreuves = [
    {label:'Oral',    date:EXAM.oral,     c:'#7C3AED'},
    {label:'Français',date:EXAM.francais, c:'#BE185D'},
    {label:'Hist+Sc.',date:EXAM.histoire, c:'#B45309'},
    {label:'Maths',   date:EXAM.maths,    c:'#1D4ED8'},
  ];
  const tlPct = Math.min(100, ELAPSED/TOTAL_D*100);

  return (
    <div style={{padding:'16px 14px 110px'}}>
      <div style={{fontSize:18, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.text, marginBottom:4}}>Tableau de bord</div>
      <div style={{fontSize:11, color:T.muted, marginBottom:16}}>Brevet DNB — 26 au 30 juin 2026</div>

      {/* J- */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:14}}>
        {epreuves.map(e=>(
          <Card key={e.label} style={{padding:'10px 6px', textAlign:'center', borderTop:`3px solid ${e.c}`}}>
            <div style={{fontSize:20, fontWeight:900, fontFamily:'Sora,sans-serif', color:e.c}}>{daysLeft(e.date)}</div>
            <div style={{fontSize:9, color:T.muted, marginTop:2, lineHeight:1.3}}>{e.label}</div>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card style={{padding:'14px', marginBottom:12}}>
        <div style={{fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:12}}>Timeline</div>
        <div style={{position:'relative', marginBottom:6}}>
          <div style={{background:T.border, borderRadius:999, height:10}}>
            <div style={{height:'100%', width:`${tlPct}%`, background:T.text, borderRadius:999}}/>
          </div>
          {epreuves.map(e=>{
            const p = Math.min(100,(e.date-START)/(EXAM.maths-START)*100);
            return (
              <div key={e.label} style={{
                position:'absolute', top:'50%', left:`${p}%`,
                transform:'translate(-50%,-50%)',
                width:16, height:16, borderRadius:'50%',
                background:T.card, border:`2.5px solid ${e.c}`,
              }}/>
            );
          })}
        </div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:T.faint}}>
          <span>17 avr.</span><span>30 juin</span>
        </div>
        {epreuves.map((e,i)=>(
          <div key={e.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'8px 0', borderBottom:i<epreuves.length-1?`1px solid ${T.border}`:'none'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{width:9,height:9,borderRadius:'50%',border:`2px solid ${e.c}`}}/>
              <span style={{fontSize:13, color:T.text}}>{e.label}</span>
            </div>
            <span style={{fontSize:14, fontWeight:800, fontFamily:'Sora,sans-serif', color:e.c}}>J-{daysLeft(e.date)}</span>
          </div>
        ))}
      </Card>

      {/* Notes simulées */}
      <Card style={{padding:'14px', marginBottom:12}}>
        <div style={{fontSize:11, fontWeight:700, color:T.text, marginBottom:12}}>Notes simulées brevet</div>
        {SUBJ.map((s,i)=>{
          const n = getNoteEstimee(notions,s.id);
          return (
            <div key={s.id} style={{padding:'9px 0', borderBottom:i<SUBJ.length-1?`1px solid ${T.border}`:'none'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                <span style={{fontSize:13, color:T.text}}>{s.e} {s.label}</span>
                <span style={{fontSize:14, fontWeight:900, fontFamily:'Sora,sans-serif', color:noteColor(n)}}>{n.toFixed(1)}/20</span>
              </div>
              <div style={{background:T.border, borderRadius:999, height:7}}>
                <div style={{height:'100%', width:`${n/20*100}%`, background:s.acc, borderRadius:999, transition:'width .4s'}}/>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Badges débloqués */}
      <Card style={{padding:'14px'}}>
        <div style={{fontSize:11, fontWeight:700, color:T.text, marginBottom:10}}>Badges débloqués</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {BADGES.map(b=>{
            const earned = game.badges.includes(b.id);
            return (
              <div key={b.id} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 10px', borderRadius:20,
                background:earned?'#F0FDF4':T.bg,
                border:`1px solid ${earned?T.okBorder:T.border}`,
                opacity:earned?1:.45,
              }}>
                <span style={{fontSize:14}}>{b.e}</span>
                <span style={{fontSize:11, fontWeight:600, color:earned?T.ok:T.muted}}>{b.name}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{padding:14, marginTop:10, background:'#F5F3FF', border:'1px solid #DDD6FE', borderLeft:`3px solid ${T.xp}`}}>
        <div style={{fontSize:11, fontWeight:700, color:'#5B21B6', marginBottom:6}}>⚠️ Nouveautés DNB 2026</div>
        <div style={{fontSize:11, color:'#6D28D9', lineHeight:1.8}}>
          • 60% épreuves finales / 40% contrôle continu{'\n'}
          • CC = moyennes annuelles 3ème uniquement{'\n'}
          • «TB avec félicitations» si {'>'} 18/20
        </div>
      </Card>
    </div>
  );
}

// ─── ONGLET REWARDS ───────────────────────────────────────────────────────────
function RewardsTab({game, notions, onRequestReward}) {
  const earned = MILESTONES.filter(m=>m.xp<=game.xp).reduce((acc,m)=>acc+m.euros,0);
  const spent  = game.rewards?.filter(r=>r.requested).reduce((acc)=>acc+0,0) || 0;

  return (
    <div style={{padding:'16px 14px 110px'}}>
      <div style={{fontSize:18, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.text, marginBottom:4}}>Mes récompenses</div>
      <div style={{fontSize:11, color:T.muted, marginBottom:16}}>Chaque XP = 1 pièce · Les paliers débloquent de l'argent réel</div>

      {/* Solde */}
      <Card style={{padding:'16px', marginBottom:14, borderTop:`3px solid ${T.reward}`, textAlign:'center'}}>
        <div style={{fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:1}}>Disponible</div>
        <div style={{fontSize:40, fontWeight:900, fontFamily:'Sora,sans-serif', color:T.reward, lineHeight:1.1}}>{earned}€</div>
        <div style={{fontSize:11, color:T.muted, marginTop:4}}>sur {MILESTONES[MILESTONES.length-1].euros}€ max</div>
      </Card>

      {/* Paliers */}
      <div style={{fontSize:11, fontWeight:700, color:T.text, marginBottom:10, textTransform:'uppercase', letterSpacing:1}}>Paliers XP</div>
      <Card style={{padding:'4px 14px 10px', marginBottom:14}}>
        {MILESTONES.map((m,i)=>{
          const unlocked = game.xp >= m.xp;
          return (
            <div key={m.xp} style={{display:'flex', alignItems:'center', gap:12,
              padding:'11px 0', borderBottom:i<MILESTONES.length-1?`1px solid ${T.border}`:'none'}}>
              <div style={{fontSize:20}}>{unlocked?'✅':'🔒'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:unlocked?T.text:T.muted}}>{m.label}</div>
                <div style={{fontSize:11, color:T.muted}}>{m.xp} XP requis</div>
                {!unlocked && (
                  <div style={{background:T.border, borderRadius:999, height:5, marginTop:4}}>
                    <div style={{height:'100%', width:`${Math.min(100,game.xp/m.xp*100)}%`, background:T.reward, borderRadius:999}}/>
                  </div>
                )}
              </div>
              <div style={{fontSize:18, fontWeight:900, fontFamily:'Sora,sans-serif',
                color:unlocked?T.reward:T.faint}}>+{m.euros}€</div>
            </div>
          );
        })}
      </Card>

      {/* Objectifs */}
      <div style={{fontSize:11, fontWeight:700, color:T.text, marginBottom:10, textTransform:'uppercase', letterSpacing:1}}>Mes objectifs</div>
      {(game.rewards||INIT_REWARDS).map(r=>{
        const canAfford = earned >= r.cost/1000*50; // simplifié pour le POC
        return (
          <Card key={r.id} style={{padding:'12px 14px', marginBottom:8}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
              <span style={{fontSize:14, fontWeight:700, color:T.text}}>{r.label}</span>
              <span style={{fontSize:13, fontWeight:800, color:T.reward, fontFamily:'Sora,sans-serif'}}>{r.cost} XP</span>
            </div>
            <div style={{background:T.border, borderRadius:999, height:6, marginBottom:8}}>
              <div style={{height:'100%', width:`${Math.min(100,game.xp/r.cost*100)}%`,
                background:T.reward, borderRadius:999, transition:'width .4s'}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontSize:10, color:T.muted}}>{Math.min(game.xp,r.cost)}/{r.cost} XP</span>
              {r.requested ? (
                <span style={{fontSize:11, color:T.ok, fontWeight:700}}>✅ Demandé à papa</span>
              ) : game.xp >= r.cost ? (
                <button onClick={()=>onRequestReward(r.id)} style={{
                  padding:'6px 14px', borderRadius:20, border:'none',
                  background:T.reward, color:'#FFF', fontSize:12, fontWeight:700, cursor:'pointer',
                }}>Demander à papa →</button>
              ) : (
                <span style={{fontSize:10, color:T.muted}}>encore {r.cost-game.xp} XP</span>
              )}
            </div>
          </Card>
        );
      })}

      <div style={{fontSize:11, color:T.faint, textAlign:'center', marginTop:12, lineHeight:1.6}}>
        Papa valide les retraits ✓{'\n'}XP = effort réel, pas les notes
      </div>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const [tab,     setTab]     = useState('home');
  const [notions, setNotions] = useState(NOTIONS);
  const [time,    setTime]    = useState(20);
  const [subject, setSubject] = useState('maths');
  const [toast,   setToast]   = useState(null);
  const [game,    setGame]    = useState({
    xp:240, streak:2, sessions:1, flashSessions:0,
    bestStreak:3, badges:['first','streak3'],
    rewards: INIT_REWARDS,
  });

  useEffect(()=>{
    const link = document.createElement('link');
    link.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap';
    link.rel='stylesheet';
    document.head.appendChild(link);
    return()=>{try{document.head.removeChild(link);}catch(e){}};
  },[]);

  const cycleStatus = useCallback((id)=>{
    setNotions(ns=>ns.map(n=>n.id===id?{...n,st:ST_CYCLE[(ST_CYCLE.indexOf(n.st)+1)%4]}:n));
  },[]);

  const handleAnswer = useCallback((nid, res, xpGain, streak)=>{
    const stMap = {ok:'maitrise', flou:'en_cours_assimilation', non:'vu_en_cours'};
    setNotions(ns=>ns.map(n=>n.id===nid?{...n,st:stMap[res]}:n));
    if (xpGain > 0) {
      setGame(g=>{
        const newXp   = g.xp + xpGain;
        const newBest = Math.max(g.bestStreak, streak);
        const newBadges = [...g.badges];
        BADGES.forEach(b=>{
          if (!newBadges.includes(b.id)) {
            const newG = {...g, xp:newXp, bestStreak:newBest, badges:newBadges};
            if (b.check(newG, notions)) newBadges.push(b.id);
          }
        });
        return {...g, xp:newXp, bestStreak:newBest, badges:newBadges};
      });
      setToast(xpGain);
    }
  },[notions]);

  const handleComplete = useCallback((isFlash)=>{
    setGame(g=>{
      const newXp      = g.xp + 50;
      const newSessions= g.sessions + 1;
      const newFlash   = isFlash ? g.flashSessions+1 : g.flashSessions;
      const newStreak  = g.streak + 1;
      const newBadges  = [...g.badges];
      const newG = {...g, xp:newXp, sessions:newSessions, flashSessions:newFlash, streak:newStreak, badges:newBadges};
      BADGES.forEach(b=>{ if (!newBadges.includes(b.id) && b.check(newG, notions)) newBadges.push(b.id); });
      return {...newG, badges:newBadges};
    });
    setToast(50);
  },[notions]);

  const handleRequestReward = useCallback((rid)=>{
    setGame(g=>({...g, rewards:(g.rewards||INIT_REWARDS).map(r=>r.id===rid?{...r,requested:true}:r)}));
  },[]);

  const TABS = [
    {id:'home',    icon:'⌂', label:'Accueil'},
    {id:'carte',   icon:'⊞', label:'Carte'},
    {id:'session', icon:'▷', label:'Session'},
    {id:'brevet',  icon:'◈', label:'Brevet'},
    {id:'rewards', icon:'💰', label:'Rewards'},
  ];

  return (
    <div style={{fontFamily:'Nunito,sans-serif', background:T.bg, minHeight:'100vh', color:T.text, maxWidth:430, margin:'0 auto', position:'relative'}}>

      {toast && <XpToast gain={toast} onDone={()=>setToast(null)}/>}

      {/* Header */}
      <div style={{background:T.card, borderBottom:`1px solid ${T.border}`, padding:'11px 14px',
        position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:16, fontWeight:900, fontFamily:'Sora,sans-serif', letterSpacing:-.5}}>BrevApp</div>
          <div style={{fontSize:9, color:T.muted}}>Brevet DNB 2026</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {game.streak>=3 && <span style={{fontSize:14}}>🔥{game.streak}</span>}
          <div style={{background:T.text, borderRadius:8, padding:'5px 11px', display:'flex', alignItems:'center', gap:5}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#EF4444', animation:'blink 2s infinite'}}/>
            <span style={{fontSize:13, fontWeight:800, color:'#FFF', fontFamily:'Sora,sans-serif'}}>J-{daysLeft(EXAM.maths)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{overflowY:'auto', height:'calc(100vh - 52px - 62px)', WebkitOverflowScrolling:'touch'}}>
        {tab==='home'    && <HomeTab    notions={notions} game={game} time={time} setTime={setTime} subject={subject} setSubject={setSubject} onStart={()=>setTab('session')} rewards={game.rewards||INIT_REWARDS}/>}
        {tab==='carte'   && <CarteTab   notions={notions} onCycle={cycleStatus}/>}
        {tab==='session' && <SessionTab notions={notions} time={time} onAnswer={handleAnswer} onComplete={handleComplete}/>}
        {tab==='brevet'  && <BrevetTab  notions={notions} game={game}/>}
        {tab==='rewards' && <RewardsTab game={game} notions={notions} onRequestReward={handleRequestReward}/>}
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:430, zIndex:100, background:T.card, borderTop:`1px solid ${T.border}`,
        display:'flex'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, padding:'9px 0 13px', border:'none', background:'transparent',
            cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative',
          }}>
            {tab===t.id && <div style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:T.text, borderRadius:999}}/>}
            <span style={{fontSize:17, marginTop:4, opacity:tab===t.id?1:.45}}>{t.icon}</span>
            <span style={{fontSize:9, fontWeight:tab===t.id?800:500, color:tab===t.id?T.text:T.muted}}>{t.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes slideDown{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
        button{font-family:Nunito,sans-serif}
      `}</style>
    </div>
  );
}

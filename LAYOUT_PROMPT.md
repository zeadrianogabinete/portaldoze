# LAYOUT_PROMPT — Correção e Estabilização do Layout portaldoze

> Prompt otimizado para LLM. Este documento é a fonte de verdade para qualquer alteração de layout.
> Última atualização: 2026-02-25

---

## 1. STACK E RESTRIÇÕES

| Item | Valor |
|------|-------|
| Framework | Vite 7 + React 19 (SPA, NÃO Next.js) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`, sem PostCSS) |
| Componentes UI | Radix UI primitives + componentes em `src/shared/components/ui/` |
| Ícones | lucide-react |
| Animações | framer-motion + @radix-ui/react-collapsible |
| CSS Variables | Definidas em `src/styles/globals.css` dentro de `@theme`, `:root` e `[data-theme='dark']` |
| Fontes | heading: Outfit/Plus Jakarta Sans, body: Inter/DM Sans |

### Convenções obrigatórias
- Código em português (comentários, labels)
- Imports com `@/` → `src/`
- Componentes em PascalCase, arquivos em camelCase/kebab-case
- Todas classes CSS devem usar: (a) Tailwind utilities, (b) `var(--nome)` para custom properties, ou (c) classes definidas explicitamente em globals.css
- **NUNCA** usar classes Tailwind que não existem (ex: `shadow-float` em vez de `shadow-[var(--shadow-float)]`)
- **NUNCA** referenciar CSS variables não definidas em globals.css

---

## 2. INVENTÁRIO DE BUGS (ESTADO ATUAL)

### BUG-01: Classe `custom-scrollbar` não existe
- **Arquivos**: `Sidebar.tsx:69`, `AppShell.tsx:50`
- **Código**: `className="... custom-scrollbar"`
- **Problema**: Classe não definida em nenhum lugar — silenciosamente ignorada pelo Tailwind
- **Fix**: Remover a classe OU definir em globals.css:
  ```css
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-neutral-300); border-radius: 2px; }
  ```

### BUG-02: `shadow-float` usado como classe nua
- **Arquivo**: `Header.tsx:126`
- **Código**: `className="... shadow-float backdrop-blur-sm"`
- **Problema**: `shadow-float` NÃO é utility Tailwind. Existe como `--shadow-float` em `@theme`, mas para usar precisa ser `shadow-[var(--shadow-float)]`
- **Fix**: Trocar `shadow-float` por `shadow-[var(--shadow-float)]`

### BUG-03: Sidebar sub-itens com texto cortado/ilegível
- **Arquivo**: `Sidebar.tsx:198-225`
- **Código**: Container com `ml-6 pl-4` dentro de sidebar de `w-[280px]`
- **Problema**: `ml-6` (24px) + `pl-4` (16px) + `px-3` (12px×2) + ícone + texto = overflow. Total de indent ~64px, sobrando ~216px para texto em font 13px
- **Fix**: Reduzir para `ml-4 pl-3` ou `ml-5 pl-3`; verificar que texto não é truncado

### BUG-04: Faixas amarela/verde removidas do header
- **Arquivo**: `Header.tsx` — não contém mais as accent bars
- **Problema**: Identidade visual do projeto antigo foi perdida
- **Fix**: Adicionar no `<header>`:
  ```tsx
  <div className="absolute bottom-0 left-0 w-full">
    <div className="h-[3px] w-full bg-[var(--color-accent-yellow)]" />
    <div className="h-[3px] w-full bg-[var(--color-accent-green)]" />
  </div>
  ```
  E garantir que o `<header>` tenha `className="relative ..."`

### BUG-05: `<main>` sem max-width wrapper
- **Arquivo**: `AppShell.tsx:50-52`
- **Código**: `<main>` renderiza `<Outlet />` diretamente sem wrapper
- **Problema**: Conteúdo se estica full-width em telas largas
- **Fix**: Envolver Outlet em `<div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">`

### BUG-06: Badge "EM BREVE" potencialmente overflow
- **Arquivo**: `Sidebar.tsx:166-170`
- **Código**: Badge com text-[9px] em flex container
- **Problema**: Em sidebar estreita, badge pode empurrar ícone/texto; `shrink-0` faltando
- **Fix**: Adicionar `shrink-0` no Badge ou usar `truncate` no título

---

## 3. REQUISITOS MÍNIMOS (Acceptance Criteria)

Cada requisito deve ser verificável visualmente OU via inspeção do DOM.

### R-01: Sidebar legível em 280px
- [ ] Todos os textos de grupos (14px+) são completamente visíveis sem truncamento
- [ ] Todos os sub-itens (13px+) são legíveis — no máximo `truncate` em textos longos
- [ ] Ícones de grupo (18-20px) nunca sobrepõem texto
- [ ] Chevron de expand/collapse visível e funcional (gira ao expandir/colapsar)
- [ ] Badges "EM BREVE" não empurram texto para fora da sidebar
- [ ] Scroll vertical funciona quando todos os grupos estão expandidos

### R-02: Header com identidade visual
- [ ] Faixas amarela (#facc15) e verde (#22c55e) visíveis na borda inferior do header
- [ ] Altura do header entre 56-72px
- [ ] Breadcrumbs ou título da página visível à esquerda
- [ ] Avatar do usuário e notificações à direita
- [ ] Dropdown do usuário abre com shadow funcional (não `shadow-float`)

### R-03: Conteúdo principal com constraint
- [ ] Max-width entre 1280-1440px centralizado
- [ ] Padding horizontal de 16-32px
- [ ] Scroll vertical suave na área de conteúdo

### R-04: Dashboard funcional
- [ ] Banner de boas-vindas renderiza sem overflow
- [ ] 4 stat cards em grid responsivo (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] Feature cards com "Em breve" para módulos desativados
- [ ] Quick links clicáveis e navegam corretamente
- [ ] Atividades recentes com timeline visual

### R-05: Mobile responsive
- [ ] Sidebar esconde em < 1024px
- [ ] Botão hamburger abre drawer com overlay
- [ ] Drawer fecha ao clicar fora ou no X
- [ ] Todo conteúdo acessível em viewport de 375px

### R-06: Zero erros de build
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run build` sem erros
- [ ] Console do browser sem erros de runtime (exceto 404 de API que é esperado)

---

## 4. MÉTRICAS DE QUALIDADE

### Contraste (WCAG AA mínimo — ratio 4.5:1 para texto normal)
| Elemento | Cor do texto | Fundo | Ratio mínimo |
|----------|-------------|-------|--------------|
| Sidebar grupo ativo | #ffffff | #0f172a | ≥ 15:1 |
| Sidebar grupo inativo | #cbd5e1 (--sidebar-text) | #0f172a | ≥ 7:1 |
| Sidebar desativado | #94a3b8 (--sidebar-text-disabled) | #0f172a | ≥ 4.5:1 |
| Sidebar sub-item | #cbd5e1 | #0f172a | ≥ 7:1 |
| Header título | --color-neutral-900 | --surface-card | ≥ 10:1 |
| Body text | --color-neutral-800 | --surface-page | ≥ 7:1 |

### Tamanhos de fonte mínimos
| Elemento | Tamanho mínimo |
|----------|---------------|
| Sidebar grupo título | 14px (text-sm) |
| Sidebar sub-item | 13px (text-[13px]) |
| Sidebar label "CONFIGURAR" | 10px (apenas uppercase tracking-wide) |
| Badge "EM BREVE" | 9px (aceitável para badge decorativo) |
| Header título | 18px (text-lg) |
| Body text | 14px (text-sm) |

### Espaçamento sidebar (dentro de 280px)
| Área | Budget máximo de indent |
|------|------------------------|
| Padding lateral da nav | 16px (px-4) |
| Grupo item | 16px padding + gap 14px + icon 19px = ~49px antes do texto |
| Sub-item (expandido) | margin-left 20px + padding-left 12px + gap 12px + ~44px antes do texto |
| **Espaço restante para texto** | **≥ 160px** (mínimo para "Comparativo de Candidatos" em 13px) |

---

## 5. ARQUIVOS A MODIFICAR

| Prioridade | Arquivo | O que corrigir |
|------------|---------|----------------|
| P0 | `src/styles/globals.css` | Definir `.custom-scrollbar` |
| P0 | `src/shared/components/layout/Sidebar.tsx` | Fix indentação sub-itens (BUG-03), shrink-0 no Badge (BUG-06) |
| P0 | `src/shared/components/layout/Header.tsx` | Fix `shadow-float` → `shadow-[var(--shadow-float)]` (BUG-02), adicionar faixas amarela/verde (BUG-04) |
| P0 | `src/shared/components/layout/AppShell.tsx` | Adicionar max-width wrapper (BUG-05) |
| P1 | `src/routes/_authenticated/index.tsx` | Verificar que dashboard não faz overflow |
| P1 | `src/shared/config/navigation.ts` | Sem mudanças necessárias — apenas referência |

---

## 6. CHECKLIST DE VALIDAÇÃO VISUAL

Após implementar, verificar cada item abrindo a aplicação em browser:

### Desktop (≥1024px)
- [ ] Sidebar fixa à esquerda, 280px, fundo navy (#0f172a)
- [ ] Logo "Portal do Zé" + "Deputado Federal" legível no topo
- [ ] 8 grupos de menu visíveis (Campanha, Agenda, Financeiro, Comunicação, Equipe, Territórios, Eleições, Histórico)
- [ ] 6 grupos mostram "EM BREVE" alinhado à direita sem overlap
- [ ] 2 grupos (Agenda, Financeiro) expandem ao clicar — chevron gira
- [ ] Sub-itens indentados com borda esquerda visível
- [ ] Seção "CONFIGURAR" com item "Configurações" abaixo de divisória
- [ ] Footer com avatar, nome, cargo, botão "Sair"
- [ ] Header com título da página, faixas amarela+verde na borda inferior
- [ ] Conteúdo centralizado com max-width, não encosta nas bordas
- [ ] Dashboard com banner, stats, features, quick links, atividades

### Mobile (375px)
- [ ] Sidebar oculta
- [ ] Hamburger visível no header
- [ ] Drawer abre com animação slide-in
- [ ] Todos os itens de menu acessíveis
- [ ] Dashboard stacks em coluna única
- [ ] Nenhum overflow horizontal

### Navegação
- [ ] Clicar em sub-item de Agenda navega para `/agenda`
- [ ] Clicar em sub-item de Financeiro navega para `/financial`
- [ ] Grupo ativo expande automaticamente (defaultOpen)
- [ ] Item ativo tem destaque visual (cor diferenciada)
- [ ] Clicar em "Configurações" navega para `/settings`

---

## 7. REFERÊNCIAS

### Projeto antigo (portaldoze_antigo) — inspiração visual
- Sidebar: `portaldoze_antigo/src/components/core/sidebar/app-sidebar.tsx`
- Header: `portaldoze_antigo/src/components/core/header/app-header.tsx`
- Layout: `portaldoze_antigo/src/app/protected/layout.tsx`
- Dashboard: `portaldoze_antigo/src/app/protected/page.tsx`

### Componentes existentes que devem ser reutilizados
- `src/shared/components/ui/Badge.tsx` — Badge com variants (CVA)
- `src/shared/components/ui/Card.tsx` — Card, CardTitle, CardDescription
- `src/shared/components/ui/StatCard.tsx` — Card de estatísticas
- `src/shared/config/navigation.ts` — Estrutura de menu (navGroups, configItems)
- `src/shared/hooks/useAuth.ts` — profile, logout
- `src/shared/hooks/usePermission.ts` — can(resource, action)
- `src/shared/hooks/useTheme.ts` — isDark, toggleTheme
- `src/shared/context/PageContext.tsx` — pageTitle, breadcrumbs
- `src/shared/utils/cn.ts` — clsx + tailwind-merge

# Félur Clínica de Estética — Site institucional

Site institucional premium da **Félur Clínica de Estética** (Viseu, Portugal).
Marca grafada com acento — **"Félur"** — em todo o texto visível do site (entidade
`F&eacute;lur` no HTML, `F%C3%A9lur` em URLs do WhatsApp). Identificadores internos
em código (`window.felurLenis`, classe `.felur-local-smooth`) mantêm-se sem acento.
**HTML / CSS / JS puro, sem frameworks e sem build step.** Abre direto no browser.

> Objetivo: levar visitantes para agendamento online (Zappy Software), WhatsApp e
> Instagram. Posicionamento premium/elegante. Português de Portugal. **Não mostrar preços.**

## Regras ao editar
- **Não** introduzir React/Vue/frameworks nem bundlers. Manter HTML/CSS/JS puro.
- Manter o design system consistente (tokens CSS em `:root`).
- Português de Portugal nos textos.
- Manter o site sempre funcional — testar mobile depois de mexer em layout.

## Estrutura
| Ficheiro | Conteúdo |
|---|---|
| `index.html` | Home: hero com vídeo, serviços, sobre, banda de benefícios+mosaico, depoimentos, CTA |
| `servicos.html` | Serviços em 3 categorias (Sobrancelhas/Micropigmentação, Laser, Rosto e Pele) |
| `sobre.html` | Sobre a Francisca Melo, propósito, espaço |
| `contacto.html` | Métodos de contacto + formulário (→ WhatsApp) + mapa Google embed |
| `visualizar_imagens.html` | Página utilitária de pré-visualização de imagens (não faz parte do site público) |
| `assets/css/style.css` | Design system completo + todas as páginas (~4000 linhas) |
| `assets/js/main.js` | Menu mobile, smooth scroll, reveals, lightbox, carrosséis, formulário |
| `assets/video/` | `hero.mp4` / `hero.webm` (vídeo do hero) + `hero-poster.jpg` |
| `img instagram/` | Fotos reais (`.webp`) — referenciadas com espaço URL-encoded (`img%20instagram/`) |

Todas as páginas públicas têm `<body class="services-template ...">` — a classe
`services-template` carrega o header/footer/botões comuns; classes extra
(`home-template`, `about-template`, `contact-template`) ativam o layout da página.

## Design system (tokens em `:root`)
- **Cores:** off-white `#FBF6EF`, surface `#F0E7D9`, sálvia `#BCC3AE`, taupe `#A2937B`,
  champagne `#C7B393`, texto `#3A332A`. CTA olive `--clr-btn #847B61`.
- **Tipografia:** Cormorant Garamond (serif, títulos) + Inter (sans, corpo).
  Carregadas via Google Fonts assíncrono no `<head>` (preconnect + `media="print" onload`).
- **Espaçamento:** escala `--sp-1..16`. **Sombra de imagens:** `--shadow-img` / `--shadow-img-hover`.

## Convenções importantes
- **Imagens:** preferir `.webp`. Nomes com espaços/acentos têm de ser URL-encoded no `src`
  (`%20`, `%C3%A7`). Fotos de conteúdo usam `loading="lazy"` (exceto LCP do topo = `eager`/`fetchpriority="high"`).
- **Menu mobile** (`.nav-mobile`): overlay full-screen; fica **fora** do `<header>` (entre
  `</header>` e `<main>`) — o `backdrop-filter` do header criava containing-block que prendia o `position:fixed`.
- **Vídeo do hero:** `preload="none"` + `<source data-src=...>`; o `main.js` injeta o `src`
  e dá play só fora de `prefers-reduced-motion`. Mobile/touch toca uma vez (sem loop).
- **Formulário de contacto:** sem backend — submete via WhatsApp com mensagem pré-formatada.

## Sistema de motion (`main.js` + fim do `style.css`)
- **Smooth scroll:** Lenis no desktop; em **touch usa scroll nativo** (sem Lenis, sem parallax)
  para não travar o arrastar. Gate: `isTouch = (hover:none) and (pointer:coarse)`.
- **Reveals de entrada:** `.reveal` / `.reveal-left/right/scale` + `.fade-up` via IntersectionObserver (`.is-visible`).
- **Parallax:** `data-parallax="0.07"` — **só desktop** (`min-width:981px` + pointer fino).
- **Carrosséis:** depoimentos (`.testi-carousel`) e trabalhos (`[data-work-carousel]`), HTML/CSS/JS puro.
- Tudo respeita `prefers-reduced-motion`.

## Performance mobile (já aplicado — não reverter sem motivo)
Bloco `@media (max-width: 980px)` no fim do `style.css`:
- `backdrop-filter` **desligado** no header e nos cards glass (re-desfocar por frame trava o scroll); trocado por fundo opaco.
- `will-change` reposto a `auto` em `.reveal*` e `.testi-track` (evita excesso de camadas de GPU → tremor no scroll).
- Parallax garantidamente sem `transform` residual.
- Hero usa `svh` (não `vh`) no mobile → não recalcula altura quando a barra do browser recolhe (evita salto).
- Hambúrguer mobile (`.services-template .nav-hamburger`, ≤520px): `position:fixed; right:16px`
  (**evitar `100vw`** — elementos fixed escapam ao `overflow-x:clip` e causavam barra horizontal + tremor).

## Peso do site — notas
- Fotos do mosaico/galerias foram convertidas de PNG (~0,5–1 MB cada) para **`.webp`** (~25–100 KB).
  Os PNG originais continuam no disco como fallback, mas o HTML aponta para os `.webp`.
- **Ficheiros pesados NÃO usados pelo site** (candidatos a limpeza manual, fora da pasta de deploy):
  `assets/video/hero_original.mp4` (~8,3 MB, original do cliente), screenshots de QA na raiz
  (`Captura de tela *.png` não referenciados, `check-*.png`, `*_preview.png`, `template hero.png`).
  Não são descarregados pelos visitantes, mas pesam no repositório.

## Como testar
Abrir os `.html` diretamente no browser (não precisa de servidor). Para mobile, usar o
device toolbar do DevTools (~390px) e confirmar: sem barra de scroll horizontal e scroll fluido.

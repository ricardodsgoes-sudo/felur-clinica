# Felur Clínica de Estética

Site institucional da **Felur Clínica de Estética** (Viseu, Portugal).
HTML, CSS e JavaScript puros — sem frameworks nem build.

## Estrutura

```
index.html        Home (hero em vídeo, serviços, sobre, diferenciais, depoimentos, CTA)
servicos.html     Serviços por categoria
sobre.html        Sobre a Francisca Melo
contacto.html     Contactos + formulário (WhatsApp) + mapa
assets/
  css/style.css   Design system completo
  js/main.js      Menu, scroll, reveals, carrossel, lightbox
  video/          Vídeo do hero (mp4 + webm) e poster
img instagram/    Imagens reais usadas no site
logo.svg
```

## Desenvolvimento

Site estático — basta abrir `index.html` ou servir a pasta:

```bash
python -m http.server 8000
```

## Deploy (Cloudflare Pages)

Projeto estático sem build:

- **Build command:** *(vazio)*
- **Build output directory:** `/` (raiz)

Ligar este repositório no Cloudflare Pages e publicar.

# Gomes Guindastes — landing page

Site estático (HTML + CSS + JS), sem build e sem dependências externas em tempo de execução:
fontes, GSAP/ScrollTrigger e Lenis estão em `assets/`.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Para publicar, basta enviar a pasta inteira para qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel, Hostinger etc.).

## WhatsApp

Todos os botões apontam para o WhatsApp. O número fica em um só lugar, no topo de
`assets/js/main.js`:

```js
const WHATSAPP_NUMBER = '554332754288';
```

Cada botão tem um atributo `data-wa` com a mensagem pronta que abre na conversa.

## Antes de publicar

A imagem de pré-visualização (quando o link é compartilhado no WhatsApp, Facebook etc.)
precisa de endereço completo. Depois de definir o domínio, troque em `index.html`:

```html
<meta property="og:image" content="https://SEU-DOMINIO/assets/img/og.jpg">
```

e acrescente `<meta property="og:url" content="https://SEU-DOMINIO/">`.

## Privacidade

O site não tem formulários, cookies, analytics nem chamadas a serviços de terceiros
(nem Google Fonts). O único link externo é o `wa.me`.

## Estrutura

```
index.html
assets/css/style.css
assets/js/main.js          # interações e sequência de rolagem do topo
assets/js/vendor/          # gsap 3.12.5, ScrollTrigger, lenis 1.1.13
assets/fonts/              # Archivo (variável) e JetBrains Mono
assets/img/                # fotos otimizadas em WebP e logotipos
```

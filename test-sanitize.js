const DOMPurify = require('isomorphic-dompurify');

function sanitizeHtmlContent(html) {
  if (!html) return '';
  
  const styleBlocks = [];
  const scriptBlocks = [];
  
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  
  let htmlWithoutProtected = html.replace(styleRegex, (match) => {
    styleBlocks.push(match);
    return `__STYLE_BLOCK_PLACEHOLDER_${styleBlocks.length - 1}__`;
  });

  htmlWithoutProtected = htmlWithoutProtected.replace(scriptRegex, (match) => {
    scriptBlocks.push(match);
    return `__SCRIPT_BLOCK_PLACEHOLDER_${scriptBlocks.length - 1}__`;
  });

  const clean = DOMPurify.sanitize(htmlWithoutProtected, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 
      'ol', 'ul', 'li', 'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 
      'tr', 'th', 'td', 'blockquote', 'code', 'pre',
      'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
      'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'clipPath',
      'input', 'button', 'form', 'label', 'textarea', 'select', 'option',
      'details', 'summary'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'className', 'target', 'rel', 'style', 'width', 'height',
      'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'viewBox', 'xmlns', 
      'cx', 'cy', 'r', 'x', 'y', 'type', 'placeholder', 'value', 'name', 'required', 'id', 'for', 
      'maxLength', 'inputMode', 'spellCheck', 'autoComplete', 'autoCapitalize', 'autoCorrect',
      'open', 'aria-hidden', 'aria-label', 'aria-live', 'aria-current', 'aria-invalid', 'aria-describedby'
    ],
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['target'],
    LIMIT_ATTR_VALS: ['target'],
  });

  let finalHtml = clean;
  styleBlocks.forEach((styleBlock, index) => {
    finalHtml = finalHtml.replace(`__STYLE_BLOCK_PLACEHOLDER_${index}__`, styleBlock);
  });

  scriptBlocks.forEach((scriptBlock, index) => {
    finalHtml = finalHtml.replace(`__SCRIPT_BLOCK_PLACEHOLDER_${index}__`, scriptBlock);
  });

  return finalHtml
    .replace(/<\/?(html|body|head|title|meta|link|canonical)\b[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');
}

const htmlInput = `
<div id="dbb-consulta-placa">
  <form id="dbb-consulta-placa-form">
    <input id="search-panel-input">
    <button type="submit">Consultar</button>
  </form>
</div>
<style>
  #dbb-consulta-placa { color: red; }
</style>
<script>
  (function(){
    console.log("Script executed!");
  })();
</script>
`;

const result = sanitizeHtmlContent(htmlInput);
console.log("=== RESULTADO ===");
console.log(result);
console.log("Contém script?", result.includes('console.log'));

export function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    txt.innerHTML = txt.value;
    return txt.value;
  }
// Own the UI glyphs instead of relying on platform emoji/font presentation.
const paths={
 '↗':'M5 19 19 5M5 5h14v14',
 '→':'M4 12h16m-6-6 6 6-6 6',
 '←':'M20 12H4m6-6-6 6 6 6',
 '↓':'M12 4v16m-6-6 6 6 6-6',
 '↥':'M12 18V4m-6 6 6-6 6 6M4 17v4h16v-4',
 '↶':'M4 10h9a7 7 0 0 1 7 7M9 5l-5 5 5 5',
 '▣':'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3ZM9 12l2 2 4-4'
};
export const hasUISymbol=value=>/[↗→←↓↥↶▣]/.test(value);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderUISymbols(value){return escape(value).replace(/[↗→←↓↥↶▣]/g,symbol=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[symbol]}"/></svg>`);}

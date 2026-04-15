function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function applyInlineFormatting(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
}

export function formatIdeaHtml(text: string) {
  return applyInlineFormatting(text)
}

export function formatComparisonHtml(text: string) {
  return applyInlineFormatting(text)
    .replace(/🏆/g, '<span class="ai-rich-text__trophy">🏆</span>')
    .replace(/✓/g, '<span class="ai-rich-text__positive">✓</span>')
    .replace(/✗/g, '<span class="ai-rich-text__negative">✗</span>')
}

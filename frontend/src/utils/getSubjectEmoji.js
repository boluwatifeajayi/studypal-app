export function getSubjectEmoji(name) {
  if (!name || typeof name !== 'string') return '📚';
  const n = name.toLowerCase();
  if (n.includes('math') || n.includes('calc') || n.includes('algebra')) return '📐';
  if (n.includes('physics') || n.includes('thermo')) return '⚛️';
  if (n.includes('chem')) return '🧪';
  if (n.includes('bio')) return '🧬';
  if (n.includes('history')) return '📜';
  if (n.includes('english') || n.includes('lit')) return '📖';
  if (n.includes('computing') || n.includes('code') || n.includes('c sharp') || n.includes('assembly') || n.includes('intro')) return '💻';
  if (n.includes('art') || n.includes('design')) return '🎨';
  if (n.includes('music')) return '🎵';
  return '📚';
}

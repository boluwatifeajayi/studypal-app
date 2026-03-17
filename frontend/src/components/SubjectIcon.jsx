import {
  HiBookOpen,
  HiCalculator,
  HiBeaker,
  HiCube,
  HiDocumentText,
  HiCodeBracketSquare,
  HiPaintBrush,
  HiMusicalNote,
} from 'react-icons/hi2';

const iconMap = [
  { match: (n) => n.includes('math') || n.includes('calc') || n.includes('algebra'), Icon: HiCalculator },
  { match: (n) => n.includes('physics') || n.includes('thermo'), Icon: HiCube },
  { match: (n) => n.includes('chem'), Icon: HiBeaker },
  { match: (n) => n.includes('bio'), Icon: HiCube },
  { match: (n) => n.includes('history'), Icon: HiDocumentText },
  { match: (n) => n.includes('english') || n.includes('lit'), Icon: HiBookOpen },
  { match: (n) => n.includes('computing') || n.includes('code') || n.includes('c sharp') || n.includes('assembly') || n.includes('intro'), Icon: HiCodeBracketSquare },
  { match: (n) => n.includes('art') || n.includes('design'), Icon: HiPaintBrush },
  { match: (n) => n.includes('music'), Icon: HiMusicalNote },
];

function getIconForSubject(name) {
  if (!name || typeof name !== 'string') return HiBookOpen;
  const n = name.toLowerCase();
  const found = iconMap.find(({ match }) => match(n));
  return found ? found.Icon : HiBookOpen;
}

export function SubjectIcon({ name, size = 18, className = '' }) {
  const Icon = getIconForSubject(name);
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: 'var(--text-secondary)' }}>
      <Icon style={{ fontSize: size }} />
    </span>
  );
}

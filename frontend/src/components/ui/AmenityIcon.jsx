import * as LucideIcons from 'lucide-react';
import { Sparkles } from 'lucide-react';

function isValidIconComponent(val) {
  if (!val) return false;
  if (typeof val === 'function') return true;
  if (typeof val === 'object' && typeof val.render === 'function') return true;
  return false;
}

export const ALL_LUCIDE_ICON_NAMES = Object.keys(LucideIcons)
  .filter((key) => {
    if (
      key === 'default' ||
      key === 'createLucideIcon' ||
      key === 'icons' ||
      key === 'Icon'
    ) {
      return false;
    }
    if (key.endsWith('Icon')) return false;
    return isValidIconComponent(LucideIcons[key]);
  })
  .sort((a, b) => a.localeCompare(b));

export const AMENITY_ICON_OPTIONS = ALL_LUCIDE_ICON_NAMES.map((name) => ({
  name,
  label: name,
  keywords: name.toLowerCase(),
  Icon: LucideIcons[name],
}));

const ALL_ICON_MAP = ALL_LUCIDE_ICON_NAMES.reduce((acc, name) => {
  acc[name.toLowerCase()] = LucideIcons[name];
  return acc;
}, {});

function normalizeIconKey(rawName) {
  return String(rawName || '')
    .trim()
    .replace(/[\s-_]+/g, '')
    .toLowerCase();
}

export default function AmenityIcon({ name, size = 16, className = '' }) {
  const key = normalizeIconKey(name);
  const IconComponent = isValidIconComponent(ALL_ICON_MAP[key])
    ? ALL_ICON_MAP[key]
    : Sparkles;

  return <IconComponent size={size} className={className} />;
}
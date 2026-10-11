import { Bath, Car, Check, ConciergeBell, Coffee, Dumbbell, ShieldCheck, Snowflake, Sunrise, Tv, Waves, Wifi, Wine } from 'lucide-react';

const ICONS = { Wifi, Snowflake, Coffee, Waves, Tv, Wine, Sunrise, Bath, Car, Dumbbell, ConciergeBell, ShieldCheck };

export default function AmenityIcon({ name, size = 16 }) {
  const Icon = ICONS[name] || Check;
  return <Icon size={size} aria-hidden="true" />;
}

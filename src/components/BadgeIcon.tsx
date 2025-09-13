import React, { memo } from "react";
import Svg, {
    Circle,
    Defs,
    Ellipse,
    LinearGradient,
    Path,
    RadialGradient,
    Stop
} from "react-native-svg";

type Variant = "bronze" | "silver" | "gold" | "platinum" | "iridescent";

type Props = {
  size?: number;
  variant?: Variant;
  subdued?: boolean; // dim for locked badges
};

const PALETTES: Record<Variant, {
  base: [string, string, string]; // center -> mid -> edge
  rim: [string, string];          // outer ring highlight
  tint?: [string, string, string]; // subtle sheen overlay
}> = {
  bronze:   { base: ["#F3D7BF", "#BE8B57", "#7A4F25"], rim: ["#FFFFFF", "#A97C50"], tint: ["#fff", "#fff0", "#fff0"] },
  silver:   { base: ["#FFFFFF", "#D7DEE6", "#9AA4AF"], rim: ["#FFFFFF", "#9FA9B2"], tint: ["#fff", "#fff0", "#fff0"] },
  gold:     { base: ["#FFF6C7", "#E1C566", "#A6771C"], rim: ["#FFFFFF", "#D1A93E"], tint: ["#fff", "#fff0", "#fff0"] },
  platinum: { base: ["#F9FAFB", "#E5E7EB", "#B6C0CA"], rim: ["#FFFFFF", "#B7C3CE"], tint: ["#fff", "#fff0", "#fff0"] },
  // "Iridescent" is a tasteful multi-hue sheen over a cool base
  iridescent: {
    base: ["#F6F8FF", "#C7D1FF", "#7E89C8"],
    rim: ["#FFFFFF", "#95A3F1"],
    // overlay sheen (soft color shift)
    tint: ["#B3E8FF", "#D9B3FF00", "#00FFC200"]
  },
};

const BadgeIcon = memo(({ size = 64, variant = "silver", subdued = false }: Props) => {
  const { base, rim, tint } = PALETTES[variant];
  const dim = subdued ? 0.55 : 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Base metallic disc */}
        <RadialGradient id={`baseGrad-${variant}-${size}`} cx="50%" cy="40%" r="65%">
          <Stop offset="0%" stopColor={base[0]} stopOpacity={1 * dim} />
          <Stop offset="55%" stopColor={base[1]} stopOpacity={1 * dim} />
          <Stop offset="100%" stopColor={base[2]} stopOpacity={1 * dim} />
        </RadialGradient>

        {/* Outer rim gloss */}
        <LinearGradient id={`rimGrad-${variant}-${size}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={rim[0]} stopOpacity={0.95 * dim} />
          <Stop offset="100%" stopColor={rim[1]} stopOpacity={0.35 * dim} />
        </LinearGradient>

        {/* Top-left specular highlight */}
        <RadialGradient id={`specGrad-${variant}-${size}`} cx="35%" cy="25%" r="35%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85 * dim} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>

        {/* Bottom rim reflection */}
        <LinearGradient id={`rimShine-${variant}-${size}`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.28 * dim} />
          <Stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>

        {/* Optional iridescent tint sweep (faked with skewed radial) */}
        <RadialGradient id={`tintGrad-${variant}-${size}`} cx="75%" cy="40%" r="80%">
          <Stop offset="0%" stopColor={(tint ?? ["#fff","#fff0","#fff0"])[0]} stopOpacity={0.25 * dim} />
          <Stop offset="60%" stopColor={(tint ?? ["#fff","#fff0","#fff0"])[1]} stopOpacity={0} />
          <Stop offset="100%" stopColor={(tint ?? ["#fff","#fff0","#fff0"])[2]} stopOpacity={0.18 * dim} />
        </RadialGradient>
      </Defs>

      {/* Soft drop "shadow" */}
      <Circle cx="52" cy="54" r="44" fill="#000" opacity={0.14 * dim} />

      {/* Outer rim */}
      <Circle cx="50" cy="50" r="46" fill={`url(#rimGrad-${variant}-${size})`} />
      <Circle cx="50" cy="50" r="44" fill="#0B1020" opacity={0.35 * dim} />

      {/* Disc */}
      <Circle cx="50" cy="50" r="41" fill={`url(#baseGrad-${variant}-${size})`} />

      {/* Inner ring (thin) */}
      <Circle cx="50" cy="50" r="36.5" fill="none" stroke="#FFFFFF" strokeOpacity={0.18 * dim} strokeWidth={1.5} />

      {/* Top-left specular bloom */}
      <Ellipse cx="39" cy="31" rx="18" ry="10" fill={`url(#specGrad-${variant}-${size})`} transform="rotate(-18 39 31)" />

      {/* Bottom rim shine */}
      <Path
        d="M16,62 A34,34 0 0 0 84,62"
        stroke={`url(#rimShine-${variant}-${size})`}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />

      {/* Iridescent tint overlay */}
      <Circle cx="50" cy="50" r="40" fill={`url(#tintGrad-${variant}-${size})`} />

      {/* Center "stud" */}
      <Circle cx="50" cy="50" r="6.5" fill="#FFFFFF" opacity={0.9 * dim} />
      <Circle cx="50" cy="50" r="5" fill="#DDE3F0" opacity={0.9 * dim} />
    </Svg>
  );
});

export default BadgeIcon;

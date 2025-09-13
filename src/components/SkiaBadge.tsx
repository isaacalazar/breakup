import { Blur, Canvas, Circle, RadialGradient, SweepGradient, vec } from "@shopify/react-native-skia";
import React from 'react';

type Variant = "bronze" | "silver" | "gold" | "platinum" | "iridescent";

type Props = {
  size?: number;
  variant?: Variant;
  subdued?: boolean;
};

const GRADIENTS: Record<Variant, {
  radial: string[];
  sweep: string[];
}> = {
  bronze: {
    radial: ["#F3D7BF", "#BE8B57", "#7A4F25"],
    sweep: ["#FFFFFF", "#A97C50", "#FFFFFF", "#BE8B57", "#FFFFFF"]
  },
  silver: {
    radial: ["#FFFFFF", "#D7DEE6", "#9AA4AF"],
    sweep: ["#FFFFFF", "#B6C0CA", "#FFFFFF", "#D7DEE6", "#FFFFFF"]
  },
  gold: {
    radial: ["#FFF6C7", "#E1C566", "#A6771C"],
    sweep: ["#FFFFFF", "#D1A93E", "#FFFFFF", "#E1C566", "#FFFFFF"]
  },
  platinum: {
    radial: ["#F9FAFB", "#E5E7EB", "#B6C0CA"],
    sweep: ["#FFFFFF", "#B7C3CE", "#FFFFFF", "#E5E7EB", "#FFFFFF"]
  },
  iridescent: {
    radial: ["#F6F8FF", "#C7D1FF", "#7E89C8"],
    sweep: ["#B3E8FF", "#D9B3FF", "#B3E8FF", "#00FFC2", "#B3E8FF"]
  }
};

export const SkiaBadge = ({ size = 64, variant = "silver", subdued = false }: Props) => {
  const { radial, sweep } = GRADIENTS[variant];
  const opacity = subdued ? 0.5 : 1;

  return (
    <Canvas style={{ width: size, height: size, opacity }}>
      {/* Main badge circle with radial gradient */}
      <Circle cx={size/2} cy={size/2} r={size*0.47}>
        <RadialGradient 
          c={vec(size*0.5, size*0.4)} 
          r={size*0.65}
          colors={radial} 
        />
      </Circle>
      
      {/* Iridescent sweep overlay */}
      <Circle cx={size/2} cy={size/2} r={size*0.44}>
        <SweepGradient 
          c={vec(size/2, size/2)}
          colors={sweep}
        />
        <Blur blur={variant === 'iridescent' ? 8 : 4} />
      </Circle>
      
      {/* Inner highlight circle */}
      <Circle cx={size*0.38} cy={size*0.32} r={size*0.12}>
        <RadialGradient 
          c={vec(size*0.38, size*0.32)} 
          r={size*0.12}
          colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0)"]} 
        />
      </Circle>
      
      {/* Center stud */}
      <Circle cx={size/2} cy={size/2} r={size*0.08}>
        <RadialGradient 
          c={vec(size/2, size/2)} 
          r={size*0.08}
          colors={["#FFFFFF", "#DDE3F0"]} 
        />
      </Circle>
    </Canvas>
  );
};

export default SkiaBadge;

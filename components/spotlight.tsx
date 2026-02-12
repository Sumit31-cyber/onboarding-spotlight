import {
  Canvas,
  RadialGradient,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import React, { FC } from "react";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface Props {
  spotlightSize: SharedValue<number>;
  opacity: SharedValue<number>;
}

export const Spotlight: FC<Props> = ({ spotlightSize, opacity }) => {
  // Bridge Reanimated values → Skia values
  const size = useDerivedValue(() => spotlightSize.value, [spotlightSize]);

  const center = useDerivedValue(
    () => vec(size.value / 2, size.value / 2),
    [size],
  );

  const radius = useDerivedValue(() => size.value / 2, [size]);

  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        opacity={opacity}
        r={radius}
        x={0}
        y={0}
        width={size}
        height={size}
      >
        <RadialGradient
          c={center}
          r={radius}
          colors={["#FFFFFF", "transparent"]}
        />
      </RoundedRect>
    </Canvas>
  );
};

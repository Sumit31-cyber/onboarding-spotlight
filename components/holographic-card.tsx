/**
 * A component that creates a holographic card effect using Skia for high-performance graphics.
 * The card displays a grid of circles with a dynamic holographic gradient that responds to step changes.
 */

import {
  Canvas,
  Group,
  interpolate,
  LinearGradient,
  Mask,
  Path,
  Rect,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import type { SharedValue } from "react-native-reanimated";
import { Extrapolation, useDerivedValue } from "react-native-reanimated";

interface HolographicCardProps {
  width: number;
  height: number;
  step: SharedValue<number>;
  color?: string;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  width,
  height,
  step,
  color = "#FFF",
}) => {
  const maskCenterX = useDerivedValue(() => {
    const position = interpolate(
      step.value,
      [1, 2, 3, 4, 5, 6],
      [0, width * 0.2, width * 0.4, width * 0.6, width * 0.8, width],
      Extrapolation.CLAMP,
    );

    return position;
  });

  const maskOpacity = useDerivedValue(() => {
    const opacity = interpolate(
      step.value,
      [0, 1, 2, 3, 4, 5],
      [0.1, 0.5, 0.9, 0.9, 0.1, 0.02],
      Extrapolation.CLAMP,
    );

    return opacity;
  });

  const mask = useMemo(() => {
    return (
      <Group>
        <Rect
          x={0}
          y={0}
          width={width}
          opacity={maskOpacity}
          height={height}
          color={"white"}
        />

        {/* Center Circle */}
        {/* <Circle
          cx={maskCenterX}
          cy={height / 2}
          r={height / 2.5}
          color={"rgba(0,0,0,1)"}
        >
          <BlurMask blur={200} style="normal" />
        </Circle> */}
      </Group>
    );
  }, [maskOpacity, width, height, maskCenterX]);

  const LogoAmountHorizontal = 25;
  const LogoSize = width / LogoAmountHorizontal;
  const LogoAmountVertical = Math.round(height / LogoSize) + 1;

  const GridPath = useMemo(() => {
    const skPath = Skia.Path.Make();
    for (let i = 0; i < LogoAmountHorizontal; i++) {
      for (let j = 0; j < LogoAmountVertical; j++) {
        skPath.addCircle(
          LogoSize / 2 + i * LogoSize,
          LogoSize / 2 + j * LogoSize,
          LogoSize / 2,
        );
      }
    }
    return skPath;
  }, [LogoAmountVertical, LogoSize]);

  return (
    <Canvas style={{ width, height, backgroundColor: "transparent" }}>
      <Group invertClip>
        {/* Main card background */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          color={"#FA5622"}
          r={5}
        />
        <Group>
          {/* Holographic effect mask */}
          <Mask mask={mask} mode="luminance">
            <Path path={GridPath}>
              {/* Holographic gradient colors */}
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: width, y: height }}
                colors={[
                  "#FFD700", // Bright gold
                  "#1E90FF", // Dodger blue
                  "#FFD700",
                  "#4169E1", // Royal blue
                  "#DAA520", // Golden rod
                  "#000080", // Navy blue
                  "#B8860B", // Dark golden rod
                  "#1E90FF",
                  "#FFD700",
                ]}
                positions={[0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1]}
              />
            </Path>
          </Mask>
        </Group>
      </Group>
    </Canvas>
  );
};

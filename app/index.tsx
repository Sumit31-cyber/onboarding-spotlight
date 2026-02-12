import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from "react-native";
// import {
//   _horizontalPadding,
//   _windowHeight,
//   _windowWidth,
//   FONTS,
//   WINDOW_HEIGHT,
//   WINDOW_WIDTH,
// } from "@/utils/constant";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import { ArrowRight } from "lucide-react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { RFValue } from "react-native-responsive-fontsize";

interface TransformationState {
  perspective: number;
  rotateX: number;
  rotateY: number;
}

interface AbsolutePositionState {
  translateX: number;
  translateY: number;
  size: number;
}

type TransformationIndex = 0 | 1 | 2 | 3 | 4 | 5;
type PositionIndex = 0 | 1 | 2 | 3 | 4 | 5;

interface ScrollViewDataItem {
  title: string;
  description: string;
}

interface OnboardingProps {
  cardData?: {
    membershipNumber: string;
    memberName: string;
    joiningDate: string;
  };
}

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = WINDOW_HEIGHT * 0.6;
const CARD_WIDTH = WINDOW_WIDTH * 0.88;
export const _horizontalPadding = WINDOW_WIDTH * 0.03;

const PRIMARY_COLOR = "#FA5622";

const transformations: Record<TransformationIndex, TransformationState> = {
  0: {
    perspective: 1000,
    rotateX: 0,
    rotateY: 0,
  },
  1: {
    perspective: 1000,
    rotateX: 15,
    rotateY: 0,
  },
  2: {
    perspective: 1000,
    rotateY: 15,
    rotateX: -10,
  },
  3: {
    perspective: 1000,
    rotateY: -15,
    rotateX: 0,
  },
  4: {
    perspective: 1000,
    rotateX: -5,
    rotateY: 0,
  },
  5: {
    perspective: 1000,
    rotateX: 0,
    rotateY: 0,
  },
};

const positions: Record<PositionIndex, AbsolutePositionState> = {
  0: {
    translateX: 0,
    translateY: 0,
    size: 600,
  },
  1: {
    translateX: 0,
    translateY: CARD_HEIGHT * 0.4,
    size: 700,
  },
  2: {
    translateX: -CARD_WIDTH * 0.4,
    translateY: -CARD_HEIGHT * 0.5,
    size: 400,
  },
  3: {
    translateX: CARD_WIDTH * 0.4,
    translateY: -CARD_HEIGHT * 0.5,
    size: 500,
  },
  4: {
    translateX: -CARD_WIDTH * 0.4,
    translateY: -CARD_HEIGHT * 0.15,
    size: 800,
  },
  5: {
    translateX: 0,
    translateY: 0,
    size: 800,
  },
};

const defaultScrollViewData: ScrollViewDataItem[] = [
  {
    title: "Welcome aboard!",
    description:
      "Replace your physical card with amazing passes into your Apple Wallet\n\nHere's a look at the key elements of any pass",
  },
  {
    title: "QR code or Barcode",
    description:
      "Capture QR code and Barcode from images, PDFs, camera, or even create your own!",
  },
  {
    title: "Logo",
    description: "Search your logos or upload your own to brand your passes.",
  },
  {
    title: "Header Field",
    description:
      "Show related information at the top of your pass - always visible in your Apple Wallet",
  },
  {
    title: "Primary and Secondary Fields",
    description: "Show more information on your pass, more prominently.",
  },
  {
    title: "You're All Set!",
    description: "Ready to create your passes!",
  },
];

const OnboardingComponent: React.FC<OnboardingProps> = ({
  cardData = {
    membershipNumber: "472284927",
    memberName: "Alex Wilson",
    joiningDate: "28 July 2025",
  },
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Shared values for animations
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const spotlightSize = useSharedValue(600);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const perspective = useSharedValue(1000);

  // Memoized animation configs
  const springConfig = useMemo(
    () => ({
      damping: 15,
      stiffness: 100,
    }),
    [],
  );

  const timingConfig = useMemo(
    () => ({
      duration: 400,
    }),
    [],
  );

  const spotlightTimingConfig = useMemo(
    () => ({
      duration: 300,
    }),
    [],
  );

  // Card rotation animation style
  const cardRotationStyle = useAnimatedStyle(() => {
    const current = transformations[activeIndex as TransformationIndex];

    if (current) {
      rotateX.value = withSpring(current.rotateX, springConfig);
      rotateY.value = withSpring(current.rotateY, springConfig);
      perspective.value = withTiming(current.perspective, timingConfig);
    }

    return {
      transform: [
        { perspective: perspective.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  }, [activeIndex, springConfig, timingConfig]);

  // Spotlight position animation style
  const spotlightPositionStyle = useAnimatedStyle(() => {
    const current = positions[activeIndex as PositionIndex];

    if (current) {
      spotlightSize.value = withTiming(current.size, spotlightTimingConfig);
      translateX.value = withSpring(current.translateX, springConfig);
      translateY.value = withSpring(current.translateY, springConfig);
    }

    return {
      height: spotlightSize.value,
      width: spotlightSize.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, [activeIndex, springConfig, spotlightTimingConfig]);

  // Handle scroll index change
  const handleIndexChange = useCallback((newIndex: number) => {
    setActiveIndex(newIndex);
  }, []);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        const offsetX = event.contentOffset.x;
        const currentScrollIndex = Math.round(offsetX / WINDOW_WIDTH);
        const clampedIndex = Math.max(
          0,
          Math.min(defaultScrollViewData.length - 1, currentScrollIndex),
        );

        if (activeIndex !== clampedIndex) {
          runOnJS(handleIndexChange)(clampedIndex);
        }
      },
    },
    [activeIndex, handleIndexChange],
  );

  // Check if spotlight should be shown
  const shouldShowSpotlight = activeIndex >= 1 && activeIndex < 5;

  // Render individual scroll page
  const renderScrollPage = useCallback(
    ({ item, index }: { item: ScrollViewDataItem; index: number }) => (
      <View key={index} style={styles.scrollPage}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          {index === defaultScrollViewData.length - 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ color: PRIMARY_COLOR }}>Get Started Now </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: PRIMARY_COLOR,
                  borderRadius: 100,
                  height: RFValue(14),
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowRight color={PRIMARY_COLOR} size={RFValue(12)} />
              </View>
            </View>
          )}
        </View>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Page indicator */}
      <View style={styles.indicatorContainer}>
        <Text style={styles.pageIndicator}>
          {activeIndex + 1}/{defaultScrollViewData.length}
        </Text>
      </View>

      {/* Horizontal scroll view */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        horizontal
        snapToInterval={WINDOW_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.scrollView}
      >
        {defaultScrollViewData.map((item, index) =>
          renderScrollPage({ item, index }),
        )}
      </Animated.ScrollView>

      {/* Animated card */}
      <Animated.View style={[cardRotationStyle, styles.animatedCard]}>
        {/* Spotlight overlay */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={StyleSheet.absoluteFill}
        >
          {shouldShowSpotlight && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={styles.spotlightContainer}
            >
              <MaskedView
                style={styles.maskedView}
                maskElement={
                  <View style={styles.maskWrapper}>
                    <Animated.View
                      style={[spotlightPositionStyle, styles.spotlightImage]}
                    >
                      <Image
                        style={styles.fullSize}
                        source={require("@/assets/images/spotlight.png")}
                        contentFit="contain"
                      />
                    </Animated.View>
                  </View>
                }
              >
                <View style={styles.spotlightOverlay} />
              </MaskedView>
            </Animated.View>
          )}
        </Animated.View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Image
              contentFit="contain"
              style={styles.logo}
              source={require("@/assets/images/spotlight_logo.png")}
            />
            <View style={styles.membershipContainer}>
              <Text style={styles.membershipLabel}>MEMBERSHIP NO</Text>
              <Text style={styles.membershipNumber}>
                {cardData.membershipNumber}
              </Text>
            </View>
          </View>

          {/* Member name section */}
          <View style={styles.nameSection}>
            <Text style={styles.memberName}>{cardData.memberName}</Text>
            <Text style={styles.nameLabel}>NAME</Text>
          </View>

          {/* Joining date section */}
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>JOINING DATE</Text>
            <Text style={styles.joiningDate}>{cardData.joiningDate}</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <Image
              contentFit="contain"
              style={styles.qrCode}
              source={require("@/assets/images/qr.jpg")}
            />
          </View>
        </View>
      </Animated.View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <StepIndictor activeIndex={activeIndex} />
      </View>
    </SafeAreaView>
  );
};

export default OnboardingComponent;

const DotIndicator = ({
  index,
  activeIndex,
}: {
  index: number;
  activeIndex: number;
}) => {
  const rStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      activeIndex,
      [index - 1, index, index + 1],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );
    const backgroundColor = interpolateColor(
      activeIndex,
      [index - 1, index, index + 1],
      ["#5E5C5F", PRIMARY_COLOR, "#5E5C5F"],
    );
    return {
      transform: [{ scale: withTiming(scale, { duration: 300 }) }],
      backgroundColor: withTiming(backgroundColor),
    };
  }, [activeIndex]);
  return (
    <Animated.View
      key={index}
      style={[
        rStyle,
        {
          height: RFValue(8),
          width: RFValue(8),
          borderRadius: 100,
        },
      ]}
    ></Animated.View>
  );
};

const StepIndictor = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {defaultScrollViewData.map((item, index) => {
        return (
          <DotIndicator key={index} activeIndex={activeIndex} index={index} />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  indicatorContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: _horizontalPadding,
    paddingVertical: 10,
  },
  pageIndicator: {
    // fontFamily: FONTS.poppinsRegular,
    color: "#C8C6C8",
    fontSize: RFValue(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollPage: {
    width: WINDOW_WIDTH,
    padding: _horizontalPadding,
    justifyContent: "flex-start",
  },
  textContainer: {
    maxWidth: WINDOW_WIDTH * 0.9,
    gap: 10,
  },
  title: {
    fontFamily: "bold",
    fontSize: RFValue(18),
    color: "#000",
  },
  description: {
    fontFamily: "regular",
    fontSize: RFValue(10),
    letterSpacing: 0.6,
    // color: "#8E8C8F",
    lineHeight: RFValue(14),
    opacity: 0.7,
  },
  animatedCard: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    position: "absolute",
    bottom: RFValue(60),
    alignSelf: "center",
    zIndex: -1,
    overflow: "hidden",
  },
  spotlightContainer: {
    flex: 1,
  },
  maskedView: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  maskWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spotlightImage: {
    position: "absolute",
  },
  spotlightOverlay: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  fullSize: {
    flex: 1,
  },
  cardContent: {
    padding: _horizontalPadding,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    height: RFValue(30),
    width: RFValue(80),
  },
  membershipContainer: {
    alignItems: "flex-end",
  },
  membershipLabel: {
    textTransform: "uppercase",
    fontSize: RFValue(8),
    color: "white",
    fontFamily: "semibold",
    letterSpacing: 1,
  },
  membershipNumber: {
    fontSize: RFValue(14),
    color: "white",
    fontFamily: "semibold",
    letterSpacing: 0.6,
  },
  nameSection: {
    marginVertical: RFValue(30),
  },
  memberName: {
    fontFamily: "regular",
    fontSize: RFValue(30),
    color: "white",
  },
  nameLabel: {
    fontFamily: "regular",
    fontSize: RFValue(10),
    color: "white",
    marginTop: -5,
  },
  dateSection: {
    marginBottom: "auto",
  },
  dateLabel: {
    textTransform: "uppercase",
    fontFamily: "regular",
    fontSize: RFValue(10),
    color: "white",
  },
  joiningDate: {
    textTransform: "uppercase",
    fontFamily: "regular",
    fontSize: RFValue(18),
    color: "white",
  },
  qrContainer: {
    alignSelf: "center",
    marginTop: "auto",
  },
  qrCode: {
    height: RFValue(100),
    width: RFValue(100),
  },
  stepIndicatorContainer: {
    height: RFValue(30),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

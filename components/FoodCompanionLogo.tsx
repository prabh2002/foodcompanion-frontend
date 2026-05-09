import React from "react";
import Svg, {
  Rect,
  Path,
  Ellipse,
  G
} from "react-native-svg";

const FoodCompanionLogo = ({
  size = 50
}: {
  size?: number;
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
    >
      <Rect
        width="200"
        height="200"
        rx="45"
        fill="#FF6B00"
      />

      <Path
        d="M100 35C69.624 35 45 59.624 45 90C45 131.25 100 175 100 175C100 175 155 131.25 155 90C155 59.624 130.376 35 100 35Z"
        fill="white"
      />

      <G transform="translate(-5 -5)">
        <Rect
          x="88"
          y="85"
          width="4"
          height="35"
          rx="2"
          fill="#FF6B00"
        />
        <Rect
          x="82"
          y="78"
          width="3"
          height="18"
          rx="1.5"
          fill="#FF6B00"
        />
        <Rect
          x="94"
          y="78"
          width="3"
          height="18"
          rx="1.5"
          fill="#FF6B00"
        />
        <Rect
          x="88"
          y="78"
          width="4"
          height="18"
          rx="2"
          fill="#FF6B00"
        />

        <Rect
          x="115"
          y="95"
          width="6"
          height="25"
          rx="3"
          fill="#FF6B00"
        />

        <Ellipse
          cx="118"
          cy="85"
          rx="10"
          ry="14"
          fill="#FF6B00"
        />
      </G>
    </Svg>
  );
};

export default FoodCompanionLogo;
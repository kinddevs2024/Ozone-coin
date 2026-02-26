import React from "react";

interface OzoneIconProps {
  size?: number;
  className?: string;
}

/**
 * Иконка: два пересекающихся круга — в одном цифра «1», в другом стрелка обновления.
 * Чёрный контур на прозрачном/белом фоне.
 */
export default function OzoneIcon({ size = 32, className = "" }: OzoneIconProps) {
  const v = 48;
  const r = 14;
  const c1 = 16;
  const c2 = 32;
  const arrowR = 8;
  const arrowCx = c2;
  const arrowCy = c2;
  const startX = arrowCx + arrowR * Math.cos((150 * Math.PI) / 180);
  const startY = arrowCy + arrowR * Math.sin((150 * Math.PI) / 180);
  const endX = arrowCx + arrowR * Math.cos((210 * Math.PI) / 180);
  const endY = arrowCy + arrowR * Math.sin((210 * Math.PI) / 180);
  const tipAngle = (210 * Math.PI) / 180;
  const b1x = endX + 3 * Math.cos(tipAngle + 0.6);
  const b1y = endY + 3 * Math.sin(tipAngle + 0.6);
  const b2x = endX + 3 * Math.cos(tipAngle - 0.6);
  const b2y = endY + 3 * Math.sin(tipAngle - 0.6);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${v} ${v}`}
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={c1} cy={c1} r={r} />
      <text
        x={c1}
        y={c1 + 5}
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="16"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
      >
        1
      </text>
      <circle cx={c2} cy={c2} r={r} />
      <path
        d={`M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${arrowR} ${arrowR} 0 1 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
      />
      <path d={`M ${endX.toFixed(2)} ${endY.toFixed(2)} L ${b1x.toFixed(2)} ${b1y.toFixed(2)} M ${endX.toFixed(2)} ${endY.toFixed(2)} L ${b2x.toFixed(2)} ${b2y.toFixed(2)}`} />
    </svg>
  );
}

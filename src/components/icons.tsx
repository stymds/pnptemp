import React from 'react';

interface IconProps {
  d: string;
  size?: number;
  stroke?: number;
  fill?: string;
}

export function Icon({ d, size = 18, stroke = 1.5, fill = 'none' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export const Icons = {
  search: <Icon d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3" />,
  bag: <Icon d="M6 7h12l-1 13H7L6 7ZM9 7a3 3 0 0 1 6 0" />,
  heart: <Icon d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
  user: <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0" />,
  menu: <Icon d="M4 7h16M4 12h16M4 17h16" />,
  close: <Icon d="M6 6l12 12M18 6L6 18" />,
  arrowR: <Icon d="M5 12h14M13 6l6 6-6 6" />,
  arrowL: <Icon d="M19 12H5M11 18l-6-6 6-6" />,
  chevR: <Icon d="M9 6l6 6-6 6" />,
  chevD: <Icon d="M6 9l6 6 6-6" />,
  plus: <Icon d="M12 5v14M5 12h14" />,
  minus: <Icon d="M5 12h14" />,
  check: <Icon d="M5 13l4 4L19 7" />,
  filter: <Icon d="M4 6h16M7 12h10M10 18h4" />,
  grid: <Icon d="M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z" />,
  list: <Icon d="M4 6h16M4 12h16M4 18h16" />,
  truck: <Icon d="M3 7h11v10H3V7ZM14 10h4l3 3v4h-7M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  shield: <Icon d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />,
  rotate: <Icon d="M4 4v6h6M20 20v-6h-6M20 10a8 8 0 0 0-14.9-3M4 14a8 8 0 0 0 14.9 3" />,
  pin: <Icon d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  mail: <Icon d="M3 6h18v12H3V6ZM3 6l9 7 9-7" />,
  star: <Icon d="M12 3l2.8 6 6.2.8-4.5 4.4 1.1 6.3L12 17.8 6.4 20.5 7.5 14 3 9.6l6.2-.6L12 3Z" fill="currentColor" />,
};

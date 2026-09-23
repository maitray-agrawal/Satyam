import React from 'react';

export interface StateEmblemProps {
  /** Size preset or custom height in pixels */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  /** Custom additional CSS classes */
  className?: string;
  /** Whether to show the Government of India / Satyameva Jayate text underneath */
  showCaption?: boolean;
  /** Light text for dark backgrounds */
  inverted?: boolean;
  /** Custom alt description */
  alt?: string;
}

export const StateEmblem: React.FC<StateEmblemProps> = ({
  size = 'md',
  className = '',
  showCaption = false,
  inverted = false,
  alt = 'State Emblem of India - Satyameva Jayate',
}) => {
  // Height mapping in pixels
  let height = 48;
  if (typeof size === 'number') {
    height = size;
  } else {
    switch (size) {
      case 'xs':
        height = 28;
        break;
      case 'sm':
        height = 36;
        break;
      case 'md':
        height = 48;
        break;
      case 'lg':
        height = 64;
        break;
      case 'xl':
        height = 84;
        break;
      case '2xl':
        height = 110;
        break;
    }
  }

  // Aspect ratio of the official emblem is ~145.52 / 231.92 = 0.627
  const width = Math.round(height * 0.6274);

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src="/emblem.svg"
        alt={alt}
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
        }}
        className="object-contain shrink-0 drop-shadow-2xs"
        referrerPolicy="no-referrer"
        loading="eager"
      />
      {showCaption && (
        <div className="mt-1 text-center">
          <div
            className={`text-[9px] font-bold tracking-wider uppercase ${
              inverted ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            सत्यमेव जयते
          </div>
          <div
            className={`text-[8px] font-semibold tracking-tight ${
              inverted ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            GOVERNMENT OF INDIA
          </div>
        </div>
      )}
    </div>
  );
};

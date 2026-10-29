import type { SVGProps } from 'react'

const PATHS = {
  search: 'M11 4a7 7 0 1 0 4.4 12.4l4 4 1.4-1.4-4-4A7 7 0 0 0 11 4Z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  arrow: 'M5 11h11.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H5v-2Z',
  play: 'M9 7.5v9l7.5-4.5L9 7.5Z',
  chevron: 'm6 9 6 6 6-6-1.4-1.4L12 12.2 7.4 7.6 6 9Z',
  check: 'm9.5 16.2-3.7-3.7L4.4 14l5.1 5.1L20 8.6l-1.4-1.4-9.1 9Z',
  calendar: 'M7 2h2v2h6V2h2v2h3v17H4V4h3V2Zm-1 8v9h12v-9H6Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm1 4v5l3.5 2-1 1.7L11 13V7h2Z',
  clipboard: 'M9 3h6l1 2h3v16H5V5h3l1-2Zm-2 4v12h10V7H7Zm2 3h6v2H9v-2Zm0 4h6v2H9v-2Z',
  heart: 'M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11Z',
  bars: 'M5 12h3v8H5v-8Zm5.500-8h3v16h-3V4ZM16 9h3v11h-3V9Z',
  trophy: 'M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.900V17h3v2H8v-2h3v-2.100A5 5 0 0 1 8.300 12H8a4 4 0 0 1-4-4V5h3V3Z',
  flame: 'M12 2s5 4.500 5 10a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 0-3-1-5.500 1-8.500Z',
  bolt: 'M13 2 5 13.500h6L10 22l8-11.500h-6L13 2Z',
  pencil: 'm4 17.300 10.600-10.600 2.700 2.700L6.700 20H4v-2.700Zm12-12.300 1.300-1.300a1.400 1.400 0 0 1 2 0l.7.700a1.400 1.400 0 0 1 0 2L18.700 7.700 16 5Z',
  trash: 'M9 3h6l1 2h4v2H4V5h4l1-2ZM6 9h12l-1 12H7L6 9Z',
  grip: 'M9 5a1.500 1.500 0 1 1 0 .01V5Zm6 0a1.500 1.500 0 1 1 0 .01V5ZM9 10.500a1.500 1.500 0 1 1 0 .01v-.01Zm6 0a1.500 1.500 0 1 1 0 .01v-.01ZM9 16a1.500 1.500 0 1 1 0 .01V16Zm6 0a1.500 1.500 0 1 1 0 .01V16Z',
} as const

export type IconName = keyof typeof PATHS

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  readonly name: IconName
  readonly size?: number
}

/** Icono decorativo de 24×24 en currentColor; el texto accesible lo aporta el elemento que lo contiene. */
export function Icon({ name, size = 20, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

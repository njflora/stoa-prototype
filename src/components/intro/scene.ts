// The welcome's drawing, as numbers: where everything sits in a 1200 by 800
// box. The components in this folder draw these; the tests check them.
//
// One-point perspective, seen from low down, close to the floor and looking
// up: the floor is near eye level and the ceiling high above, so the columns
// tower overhead. Everything is placed by its depth: `d` is 1 at the
// entrance and shrinks towards 0 down the corridor; above 1 is nearer than
// the entrance. A point at depth d sits at VP + offset * d, so all lines meet
// at the vanishing point, VP, where the seal waits.

export const W = 1200
export const H = 800
/** The vanishing point, in the middle of the box: where the seal sits. */
export const VP = { x: 600, y: 400 }
/** The top band: sky from 0 to 50, then the lintel. */
export const BAND = { w: 1200, h: 64, sky: 50 }

export const HALF_WIDTH = 560 // from the middle of the floor to a column's centre, at the entrance
const FLOOR = 160 // below eye level, at the entrance: a low viewpoint
export const CEILING = 520 // above eye level, at the entrance
const FAR = 0.155 // the depth of the far end, where the corridor opens to the sunset
const NEAR = 2.6 // nearer than the entrance, far enough for the floor to reach the bottom of the screen

const at = (offsetX: number, offsetY: number, d: number) => `${VP.x + offsetX * d},${VP.y + offsetY * d}`

// Heights above eye level (negative is up) for each part of a column.
const SHAFT_TOP = -440
const ECHINUS_TOP = -460
const ABACUS_TOP = -474

/** One Doric column at depth d on the given side: a tapering fluted shaft, its cushion and slab. */
function column(side: -1 | 1, d: number) {
  const x = side * HALF_WIDTH
  return {
    key: `${side}${d}`,
    d,
    shaft: [at(x - 38, FLOOR, d), at(x + 38, FLOOR, d), at(x + 30, SHAFT_TOP, d), at(x - 30, SHAFT_TOP, d)].join(' '),
    echinus: [
      at(x - 30, SHAFT_TOP, d),
      at(x + 30, SHAFT_TOP, d),
      at(x + 48, ECHINUS_TOP, d),
      at(x - 48, ECHINUS_TOP, d),
    ].join(' '),
    abacus: [
      at(x - 50, ECHINUS_TOP, d),
      at(x + 50, ECHINUS_TOP, d),
      at(x + 50, ABACUS_TOP, d),
      at(x - 50, ABACUS_TOP, d),
    ].join(' '),
    flutes:
      d > 0.3
        ? [-19, -6, 6, 19].map((f) => ({
            x1: VP.x + (x + f) * d,
            x2: VP.x + (x + f * 0.8) * d,
            y1: VP.y + FLOOR * d,
            y2: VP.y + SHAFT_TOP * d,
          }))
        : [],
  }
}
// Columns at evenly spaced steps down the corridor, drawn far to near so
// nearer columns overlap the ones behind.
const steps = Array.from({ length: 14 }, (_, k) => 1 / (1 + 0.42 * k)).filter((d) => d > FAR)
export const columns = [...steps].reverse().flatMap((d) => [column(-1, d), column(1, d)])
// Ceiling beams, closer together than the columns, as in the real stoa.
export const beams = Array.from({ length: 34 }, (_, k) => 1.2 / (1 + 0.2 * k)).filter((d) => d > FAR)

// The big shapes, each a quadrilateral from near the viewer to the far end.
const quad = (a: [number, number], b: [number, number]) =>
  [at(a[0], a[1], NEAR), at(b[0], b[1], NEAR), at(b[0], b[1], FAR), at(a[0], a[1], FAR)].join(' ')
export const floor = quad([-HALF_WIDTH - 60, FLOOR], [HALF_WIDTH + 60, FLOOR])
export const ceiling = quad([-HALF_WIDTH - 60, -CEILING], [HALF_WIDTH + 60, -CEILING])
export const leftWall = quad([-HALF_WIDTH - 60, -CEILING], [-HALF_WIDTH - 60, FLOOR])
export const rightWall = quad([HALF_WIDTH + 60, -CEILING], [HALF_WIDTH + 60, FLOOR])
// The architrave running along the tops of each row of columns.
export const leftBeam = quad([-HALF_WIDTH - 50, -CEILING], [-HALF_WIDTH - 50, ABACUS_TOP])
export const rightBeam = quad([HALF_WIDTH + 50, -CEILING], [HALF_WIDTH + 50, ABACUS_TOP])
// The far end: the opening where the corridor meets the sunset.
export const end = {
  x: VP.x - (HALF_WIDTH + 60) * FAR,
  y: VP.y - CEILING * FAR,
  w: (HALF_WIDTH + 60) * 2 * FAR,
  h: (CEILING + FLOOR) * FAR,
}
// The neon floor: lines running to the vanishing point, and cross lines at
// each column and nearer, crowding together into the distance.
export const floorRays = Array.from({ length: 25 }, (_, i) => (i - 12) * 70).map((offset) => ({
  x1: VP.x + offset * FAR,
  y1: VP.y + FLOOR * FAR,
  x2: VP.x + offset * NEAR,
  y2: VP.y + FLOOR * NEAR,
}))
export const floorLines = [...steps, 1.3, 1.65, 2.1, 2.6].map((d) => VP.y + FLOOR * d)

// The sun sits on the far end's floor line. Its lower half is cut by
// vaporwave stripes: thin and far apart near the middle, thicker and closer
// together towards the horizon.
export const SUN_Y = VP.y + 12
export const sunStripes: { y: number; h: number }[] = []
for (let i = 0, y = SUN_Y - 30; i < 7; i++) {
  const h = 1 + 0.57 * i
  sunStripes.push({ y, h })
  y += h + 7 - 0.9 * i // the band of sun before the next stripe narrows each time
}

/** Stars in the band's strip of night sky: x, y and radius. */
export const topStars = [
  [60, 14, 1.2],
  [150, 34, 0.9],
  [240, 10, 1.1],
  [330, 28, 0.8],
  [420, 16, 1],
  [780, 20, 1],
  [870, 36, 0.9],
  [960, 12, 1.2],
  [1050, 30, 0.8],
  [1140, 18, 1.1],
  [500, 40, 0.7],
  [700, 8, 0.8],
] as const

// The wax: a circle with a few soft bulges, so it looks poured, not stamped.
export const waxPath = (() => {
  const points: string[] = []
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const r = 46 + 3 * Math.sin(a * 5) + 2 * Math.sin(a * 9 + 1)
    points.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`)
  }
  return `M${points.join('L')}Z`
})()
export const laurel = Array.from({ length: 16 }, (_, i) => (i / 16) * 360)
// The E of Delphi, the old form carved at Apollo's temple: an upright and a
// crossbar between two arcs that bow towards the middle. Drawn about the
// seal's centre, about 40 units tall.
export const DELPHIC_E = [
  'M-14,-20 Q-0.6,0 -14,20', // left arc
  'M14,-20 Q0.6,0 14,20', // right arc
  'M0,-15.5 V15.5', // upright
  'M-15.8,0 H15.8', // crossbar
].join(' ')

/**
 * Where the seal and the band sit on a screen of the given size. The
 * corridor fills the screen (preserveAspectRatio "slice"), centred, so the
 * vanishing point and the seal on it are always in the middle. The band is
 * pinned to the top, so the name is never cropped whatever the screen's shape.
 */
export function placement(screen: { w: number; h: number }) {
  const scale = Math.max(screen.w / W, screen.h / H)
  const x = (screen.w - W * scale) / 2 + VP.x * scale
  const y = (screen.h - H * scale) / 2 + VP.y * scale
  // The band keeps its proportions on wide screens and never gets thinner than 52px.
  const band = Math.min(110, Math.max(52, (BAND.h * screen.w) / BAND.w))
  return {
    x,
    y,
    // At least 56px to tap on a phone, at most 150px on very wide screens.
    size: Math.min(150, Math.max(56, 112 * scale)),
    band,
    // Just below the band, so the buttons never sit on the name.
    belowLintel: band + 12,
  }
}

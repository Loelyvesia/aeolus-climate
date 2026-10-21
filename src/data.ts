export type Zone = '极地' | '寒带' | '温带' | '亚热带' | '热带雨林' | '干旱' | '高原'

export interface City {
  name: string
  x: number // longitude on atlas plate (0-100)
  y: number // latitude on atlas plate (0=north, 100=south)
  lat: number // degrees, -80..80
  elevation: number // meters
  zone: Zone
  wetPeak: number // month of wettest season
}

export const ZONE_COLOR: Record<Zone, string> = {
  '极地': '#8fd3e8',
  '寒带': '#6bb8d4',
  '温带': '#4f9e77',
  '亚热带': '#c9a24b',
  '热带雨林': '#2f9e5a',
  '干旱': '#d8a14a',
  '高原': '#9a6fb8',
}

export const ZONES: Zone[] = ['极地', '寒带', '温带', '亚热带', '热带雨林', '干旱', '高原']

export const cities: City[] = [
  { name: '埃温冰原 Evyn', x: 12, y: 8, lat: 72, elevation: 200, zone: '极地', wetPeak: 7 },
  { name: '霜崖 Frostcliff', x: 58, y: 5, lat: 76, elevation: 900, zone: '极地', wetPeak: 7 },
  { name: '松原 Pinefield', x: 30, y: 22, lat: 52, elevation: 300, zone: '寒带', wetPeak: 7 },
  { name: '白河谷 Whitevalley', x: 72, y: 20, lat: 54, elevation: 420, zone: '寒带', wetPeak: 7 },
  { name: '风都 Aeolia', x: 50, y: 42, lat: 34, elevation: 120, zone: '温带', wetPeak: 8 },
  { name: '云港 Cloudport', x: 76, y: 38, lat: 38, elevation: 30, zone: '温带', wetPeak: 9 },
  { name: '石城 Stonehaven', x: 28, y: 48, lat: 30, elevation: 260, zone: '温带', wetPeak: 8 },
  { name: '银叶城 Silverleaf', x: 63, y: 50, lat: 28, elevation: 380, zone: '温带', wetPeak: 8 },
  { name: '日光城 Heliopolis', x: 40, y: 58, lat: 20, elevation: 90, zone: '亚热带', wetPeak: 9 },
  { name: '珊瑚湾 Coral Bay', x: 82, y: 60, lat: 18, elevation: 10, zone: '亚热带', wetPeak: 9 },
  { name: '橄榄丘 Olivehill', x: 20, y: 62, lat: 16, elevation: 180, zone: '亚热带', wetPeak: 8 },
  { name: '沙洲 Dunehold', x: 60, y: 45, lat: 32, elevation: 220, zone: '干旱', wetPeak: 2 },
  { name: '灼原 Scorchplain', x: 25, y: 52, lat: 27, elevation: 350, zone: '干旱', wetPeak: 2 },
  { name: '盐漠 Saltwaste', x: 80, y: 50, lat: 29, elevation: 120, zone: '干旱', wetPeak: 2 },
  { name: '绿潮城 Verdantide', x: 52, y: 72, lat: 8, elevation: 40, zone: '热带雨林', wetPeak: 10 },
  { name: '雨帘 Fallsreach', x: 68, y: 78, lat: 2, elevation: 150, zone: '热带雨林', wetPeak: 11 },
  { name: '蕨原 Fernland', x: 35, y: 80, lat: -4, elevation: 80, zone: '热带雨林', wetPeak: 10 },
  { name: '天阶 Skyreach', x: 50, y: 35, lat: 40, elevation: 3200, zone: '高原', wetPeak: 7 },
  { name: '星脊 Starridge', x: 38, y: 30, lat: 45, elevation: 2800, zone: '高原', wetPeak: 7 },
  { name: '极南港 Southlight', x: 50, y: 94, lat: -72, elevation: 20, zone: '极地', wetPeak: 1 },
  { name: '南风湾 Southwind', x: 62, y: 86, lat: -48, elevation: 60, zone: '寒带', wetPeak: 1 },
  { name: '赤焰谷 Embervale', x: 45, y: 66, lat: 12, elevation: 500, zone: '干旱', wetPeak: 2 },
  { name: '蓝湖城 Laketown', x: 15, y: 40, lat: 37, elevation: 100, zone: '温带', wetPeak: 8 },
  { name: '苔原港 Tundraport', x: 84, y: 15, lat: 58, elevation: 20, zone: '寒带', wetPeak: 7 },
]

// Deterministic climate generator (fictional, clearly labeled)
const RAIN_BASE: Record<Zone, number> = {
  '极地': 35, '寒带': 60, '温带': 90, '亚热带': 110, '热带雨林': 240, '干旱': 18, '高原': 70,
}

export function tempOf(c: City, month: number): number {
  const base = 28 - 0.55 * Math.abs(c.lat) - 6.5 * (c.elevation / 1000)
  const amp = Math.min(18, 4 + 0.25 * Math.abs(c.lat))
  const peak = c.lat >= 0 ? 7 : 1
  return base + amp * Math.cos((2 * Math.PI * (month - peak)) / 12)
}

export function rainOf(c: City, month: number): number {
  const base = RAIN_BASE[c.zone]
  const seasonal = 1 + 0.75 * Math.cos((2 * Math.PI * (month - c.wetPeak)) / 12)
  return Math.max(0, Math.round(base * seasonal))
}

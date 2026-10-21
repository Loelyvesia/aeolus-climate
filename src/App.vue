<script setup lang="ts">
import { computed, ref } from 'vue'
import { cities, ZONES, ZONE_COLOR, tempOf, rainOf, type City, type Zone } from './data'

const selectedName = ref('风都 Aeolia')
const zoneFilter = ref<Zone | '全部'>('全部')
const metric = ref<'temp' | 'rain'>('temp')
const month = ref(7)

const selected = computed<City>(() => cities.find(c => c.name === selectedName.value) ?? cities[0])
const visible = computed(() => zoneFilter.value === '全部' ? cities : cities.filter(c => c.zone === zoneFilter.value))

const MAP_W = 820, MAP_H = 520
const series = computed(() => {
  const c = selected.value
  return Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
    m,
    temp: tempOf(c, m),
    rain: rainOf(c, m),
  }))
})

const chartW = 620, chartH = 260, cp = { l: 44, r: 16, t: 20, b: 34 }
const tempMax = 32, tempMin = -16
function yOfTemp(t: number) { return cp.t + ((tempMax - t) / (tempMax - tempMin)) * (chartH - cp.t - cp.b) }
function yOfRain(r: number) { return chartH - cp.b - (r / 280) * (chartH - cp.t - cp.b) }
function xOf(m: number) { return cp.l + ((m - 1) / 11) * (chartW - cp.l - cp.r) }

const tempPoints = computed(() => series.value.map(s => `${xOf(s.m)},${yOfTemp(s.temp)}`).join(' '))
</script>

<template>
  <main class="app">
    <header class="hero">
      <p class="kicker">数据可视化 · 虚构星球气候（模拟数据）</p>
      <h1>风之城</h1>
      <p class="lede">
        一颗架空行星「埃奥洛斯」上的 24 座城市：在星图面板上按气候带着色分布，
        点击任意城市，右侧便展开它全年的气温与降水曲线，并可用月份滑杆查看逐月读数。
      </p>
      <p class="note">本作品全部为虚构 / 程序生成的模拟数据，用于演示气候可视化，不代表任何真实星球。</p>
    </header>

    <section class="controls">
      <div class="zone-filter">
        <button :class="{ on: zoneFilter === '全部' }" @click="zoneFilter = '全部'">全部</button>
        <button v-for="z in ZONES" :key="z" :class="{ on: zoneFilter === z }" @click="zoneFilter = z">{{ z }}</button>
      </div>
      <div class="metric-toggle">
        <button :class="{ on: metric === 'temp' }" @click="metric = 'temp'">气温</button>
        <button :class="{ on: metric === 'rain' }" @click="metric = 'rain'">降水</button>
      </div>
    </section>

    <section class="map-panel">
      <h2>星图面板</h2>
      <p class="sub">圆点 = 城市，颜色 = 气候带；点击城市查看气候曲线。</p>
      <svg :viewBox="`0 0 ${MAP_W} ${MAP_H}`" class="atlas" role="img" aria-label="虚构星球城市气候图">
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#16303f" />
            <stop offset="100%" stop-color="#0b1c26" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" :width="MAP_W" :height="MAP_H" rx="22" fill="url(#sea)" />
        <g class="grid">
          <line v-for="i in 9" :key="'v'+i" :x1="i*MAP_W/10" y1="0" :x2="i*MAP_W/10" y2="MAP_H" />
          <line v-for="i in 5" :key="'h'+i" x1="0" :y1="i*MAP_H/6" x2="MAP_W" :y2="i*MAP_H/6" />
        </g>
        <path d="M140,120 C210,80 300,70 360,130 C420,190 390,260 330,290 C260,320 180,290 150,230 C120,180 120,150 140,120 Z" class="land" />
        <path d="M500,250 C570,210 670,215 720,270 C760,315 720,380 650,390 C570,400 500,360 490,305 C485,285 490,265 500,250 Z" class="land" />
        <path d="M300,390 C360,370 420,380 450,420 C470,450 450,490 400,500 C350,510 300,490 290,450 C282,425 285,400 300,390 Z" class="land" />
        <g v-for="c in visible" :key="c.name" class="city" @click="selectedName = c.name">
          <circle :cx="c.x / 100 * MAP_W" :cy="c.y / 100 * MAP_H" :r="selected.name === c.name ? 9 : 6"
            :fill="ZONE_COLOR[c.zone]" :stroke="selected.name === c.name ? '#fff' : 'none'" stroke-width="2"
            :opacity="metric === 'temp' ? 1 : 0.9" />
          <title>{{ c.name }} — {{ c.zone }}，海拔 {{ c.elevation }} m</title>
        </g>
      </svg>
      <div class="legend">
        <span v-for="z in ZONES" :key="z"><i :style="{ background: ZONE_COLOR[z] }"></i>{{ z }}</span>
      </div>
    </section>

    <section class="split">
      <div class="panel">
        <h2>{{ selected.name }}</h2>
        <dl>
          <div><dt>气候带</dt><dd>{{ selected.zone }}</dd></div>
          <div><dt>海拔</dt><dd>{{ selected.elevation }} m</dd></div>
          <div><dt>纬度</dt><dd>{{ selected.lat }}°</dd></div>
          <div><dt>{{ month }} 月气温</dt><dd>{{ tempOf(selected, month).toFixed(1) }}°C</dd></div>
        </dl>
        <label class="month">
          月份 <input type="range" v-model.number="month" min="1" max="12" aria-label="月份" /> <output>{{ month }} 月</output>
        </label>
      </div>

      <div class="panel">
        <h2>全年气候</h2>
        <p class="sub">气温（曲线，左轴 °C）与降水（柱，右轴 mm）。</p>
        <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="chart" role="img" aria-label="月气温与降水图">
          <line :x1="cp.l" :y1="yOfTemp(0)" :x2="chartW-cp.r" :y2="yOfTemp(0)" class="zero" />
          <g v-for="s in series" :key="s.m">
            <rect :x="xOf(s.m)-10" :y="yOfRain(s.rain)" :width="20" :height="chartH-cp.b-yOfRain(s.rain)" class="rainbar" :opacity="metric === 'rain' ? 0.9 : 0.35" />
            <text :x="xOf(s.m)" :y="chartH-cp.b+14" class="tick" text-anchor="middle">{{ s.m }}</text>
          </g>
          <polyline :points="tempPoints" fill="none" class="templine" :opacity="metric === 'temp' ? 1 : 0.45" />
          <circle v-if="metric === 'temp'" :cx="xOf(month)" :cy="yOfTemp(tempOf(selected, month))" r="6" class="tempdot" />
        </svg>
      </div>
    </section>

    <footer class="about">
      <h2>关于这份数据</h2>
      <p>
        埃奥洛斯星球及其城市、地形与气候均为虚构设定。气温与降水由确定性公式从纬度、海拔与气候带生成
        （气温随纬度降低、随海拔递减，降水带季节性峰值），属<strong>模拟数据</strong>，不代表真实观测。
        视觉编码：<strong>位置 = 地图坐标，颜色 = 气候带，曲线/柱 = 月气温与降水</strong>。
      </p>
    </footer>
  </main>
</template>

<style>
:root { --bg: #0e1720; --ink: #dce8ee; --muted: #7f95a3; --line: #203441; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: 'Segoe UI', system-ui, sans-serif; }
.app { max-width: 1120px; margin: 0 auto; padding: 48px 22px 80px; }
.kicker { color: #4fd1c5; letter-spacing: 0.3em; text-transform: uppercase; font-size: 12px; }
h1 { font-size: clamp(42px, 7vw, 80px); margin: 10px 0 14px; line-height: 1; font-weight: 800; letter-spacing: 0.01em; }
.lede { max-width: 64ch; font-size: 17px; line-height: 1.7; color: #b6c9d3; }
.note { color: var(--muted); font-size: 13px; }

.controls { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin: 26px 0; }
.zone-filter { display: flex; flex-wrap: wrap; gap: 7px; }
.zone-filter button { background: #142530; color: #9fb5c1; border: 1px solid var(--line); border-radius: 999px; padding: 7px 13px; cursor: pointer; font-size: 13px; }
.zone-filter button.on { background: #1f3a49; color: #e8f6fb; border-color: #4fd1c5; }
.zone-filter button:focus-visible { outline: 2px solid #4fd1c5; outline-offset: 2px; }
.metric-toggle { display: flex; gap: 6px; margin-left: auto; }
.metric-toggle button { background: #142530; border: 1px solid var(--line); color: #9fb5c1; border-radius: 8px; padding: 7px 14px; cursor: pointer; font-size: 13px; }
.metric-toggle button.on { background: #e8641b; border-color: #e8641b; color: #160d08; }
.metric-toggle button:focus-visible { outline: 2px solid #e8641b; outline-offset: 2px; }

.map-panel { background: #111f2a; border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
.map-panel h2, .panel h2 { margin: 0 0 6px; font-size: 20px; }
.sub { color: var(--muted); font-size: 13px; margin: 0 0 12px; }
.atlas { width: 100%; height: auto; }
.grid line { stroke: #1d3948; stroke-width: 0.5; }
.land { fill: #1d3444; stroke: #2b4a5c; stroke-width: 1; }
.city { cursor: pointer; }
.legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 13px; color: #9fb5c1; }
.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 4px; }

.split { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 22px; margin-top: 24px; }
.panel { background: #111f2a; border: 1px solid var(--line); border-radius: 16px; padding: 22px; }
dl { margin: 14px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px; }
dt { color: var(--muted); font-size: 12px; }
dd { margin: 3px 0 0; font-size: 18px; font-weight: 700; }
.month { display: flex; gap: 10px; align-items: center; font-size: 14px; color: #b6c9d3; }
.month input { accent-color: #4fd1c5; }
.month output { font-weight: 700; }

.chart { width: 100%; height: auto; }
.zero { stroke: #365264; stroke-width: 1; }
.tick { fill: #6e8696; font-size: 10px; }
.rainbar { fill: #2f7e9e; }
.templine { stroke: #e8641b; stroke-width: 2.5; }
.tempdot { fill: #e8641b; stroke: #fff; stroke-width: 2; }

.about { margin-top: 42px; border-top: 1px solid var(--line); padding-top: 26px; max-width: 74ch; }
.about p { color: #b6c9d3; line-height: 1.75; }

@media (max-width: 820px) {
  .split { grid-template-columns: 1fr; }
  .metric-toggle { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>

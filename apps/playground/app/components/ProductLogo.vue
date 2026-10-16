<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-lg"
    :style="{ background: SURFACE, border: `1px solid ${AMBER}66` }"
    role="img"
    aria-label="nuxt-cookie-consent"
  >
    <svg
      class="w-[66%] overflow-visible"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <template
        v-for="(group, g) in GROUPS"
        :key="g"
      >
        <rect
          v-for="([x, y], i) in group.px"
          :key="i"
          :x="x"
          :y="y"
          width="1.5"
          height="1.5"
          :fill="group.fill"
        />
      </template>
    </svg>
  </span>
</template>

<script setup lang="ts">
// The nuxt-cookie-consent mark: pixel art in the websideproject gradient on a dark tile — an amber cookie with a bite
// out of it, pink and violet chips. Size it from the outside (`class="size-8"`).
type Px = [number, number]

const AMBER = '#ffbd7a'
const PINK = '#fe8bbb'
const VIOLET = '#9e7aff'
const SURFACE = '#14141e'

const GROUPS: { px: Px[], fill: string }[] = [
  { px: [[2, 0], [4, 0], [6, 0], [0, 2], [4, 2], [6, 2], [8, 2], [0, 4], [2, 4], [4, 4], [6, 4], [10, 4], [0, 6], [2, 6], [6, 6], [8, 6], [10, 6], [0, 8], [2, 8], [4, 8], [6, 8], [10, 8], [2, 10], [4, 10], [6, 10], [8, 10]], fill: AMBER },
  { px: [[8, 4], [4, 6]], fill: PINK },
  { px: [[2, 2], [8, 8]], fill: VIOLET },
]
</script>

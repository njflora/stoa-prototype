// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { oneOf, pageField } from '@/utils/address'
import { useAddressState } from '../useAddressState'

// useAddressState with a real router, as a page would use it.

type View = { sort: 'newest' | 'popular'; page: number }

async function setUp(start: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/articles', component: { render: () => null } }],
  })
  let state!: ReturnType<typeof useAddressState<View>>
  const Page = defineComponent({
    setup() {
      state = useAddressState<View>({ sort: oneOf(['newest', 'popular'], 'newest'), page: pageField() })
      return () => h('div')
    },
  })
  const app = createApp(Page).use(router)
  await router.push(start)
  app.mount(document.createElement('div'))
  return { router, state }
}

describe('useAddressState', () => {
  it('reads the view from the address', async () => {
    const { state } = await setUp('/articles?sort=popular&page=3')
    expect(state.view.value).toEqual({ sort: 'popular', page: 2 })
  })

  it('starts again from page 1 when a filter changes, as a new history entry', async () => {
    const { router, state } = await setUp('/articles?page=3')
    state.model('sort').value = 'popular'
    await router.isReady()
    await new Promise((resolve) => setTimeout(resolve))
    expect(router.currentRoute.value.fullPath).toBe('/articles?sort=popular')

    router.back()
    await new Promise((resolve) => setTimeout(resolve))
    expect(router.currentRoute.value.fullPath).toBe('/articles?page=3')
  })

  it('keeps the filters when only the page changes', async () => {
    const { state } = await setUp('/articles?sort=popular')
    expect(state.query({ page: 4 })).toEqual({ sort: 'popular', page: '5' })
  })
})

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, type App } from 'vue'
import VodSettings from '../VodSettings.vue'

// The player's settings menu, mounted on its own and used as a viewer would.

let app: App | undefined
afterEach(() => {
  app?.unmount()
  document.body.innerHTML = ''
})

async function mount(props: { quality?: string; speed?: number; live?: boolean } = {}) {
  const events = { quality: vi.fn(), speed: vi.fn(), close: vi.fn() }
  const host = document.body.appendChild(document.createElement('div'))
  app = createApp({
    render: () =>
      h(VodSettings, {
        qualities: ['Auto', '1080p', '720p'],
        quality: props.quality ?? 'Auto',
        speed: props.speed ?? 1,
        live: props.live,
        onQuality: events.quality,
        onSpeed: events.speed,
        onClose: events.close,
      }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return { host, events }
}

const buttons = (host: HTMLElement) => [...host.querySelectorAll('button')]
/** A button's text as a person reads it: spaces collapsed. */
const label = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()
const button = (host: HTMLElement, text: string) => buttons(host).find((b) => label(b).startsWith(text))!
const click = async (el: HTMLElement) => {
  el.click()
  await nextTick()
  await nextTick()
}

describe('VodSettings', () => {
  it('opens on Quality and Speed, with the keyboard on the first', async () => {
    const { host } = await mount({ speed: 1.5 })
    expect(buttons(host).map(label)).toEqual(['Quality Auto', 'Speed 1.5×'])
    expect(document.activeElement).toBe(buttons(host)[0])
  })

  it('has no speed for a live stream', async () => {
    const { host } = await mount({ live: true })
    expect(buttons(host).map(label)).toEqual(['Quality Auto'])
  })

  it('reports a new quality and goes back to the first level', async () => {
    const { host, events } = await mount()
    await click(button(host, 'Quality'))
    await click(button(host, '720p'))
    expect(events.quality).toHaveBeenCalledWith('720p')
    expect(button(host, 'Quality')).toBeTruthy()
  })

  it('does not report the quality already playing', async () => {
    const { host, events } = await mount({ quality: '1080p' })
    await click(button(host, 'Quality'))
    await click(button(host, '1080p'))
    expect(events.quality).not.toHaveBeenCalled()
  })

  it('reports a preset speed, and any speed from the slider', async () => {
    const { host, events } = await mount()
    await click(button(host, 'Speed'))
    await click(button(host, '1.25×'))
    expect(events.speed).toHaveBeenCalledWith(1.25)

    await click(button(host, 'Speed'))
    const slider = host.querySelector<HTMLInputElement>('input[type=range]')!
    slider.value = '2.35'
    slider.dispatchEvent(new Event('input'))
    expect(events.speed).toHaveBeenLastCalledWith(2.35)
  })

  it('closes on Escape', async () => {
    const { host, events } = await mount()
    host.querySelector('[role=group]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(events.close).toHaveBeenCalled()
  })
})

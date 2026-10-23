// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { focusableIn, keepTabInside } from '../focus'

// A dialog with a link, a field and two buttons, and a page link outside it.
// jsdom does no layout, so every element is given a box by hand; a hidden
// one keeps none.

function setUp() {
  document.body.innerHTML = `
    <a id="behind" href="/">Behind the dialog</a>
    <section id="dialog">
      <a id="join" href="/join">Join</a>
      <input id="field" />
      <button id="hidden" hidden>Hidden</button>
      <button id="disabled" disabled>Disabled</button>
      <button id="cancel">Cancel</button>
      <button id="buy">Buy</button>
    </section>`
  for (const el of document.querySelectorAll<HTMLElement>('a, input, button')) {
    el.getClientRects = () => (el.hidden ? [] : [new DOMRect(0, 0, 10, 10)]) as unknown as DOMRectList
  }
  return document.getElementById('dialog')!
}

const tab = (shiftKey = false) => new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true })
const focused = () => document.activeElement?.id

let dialog: HTMLElement
beforeEach(() => {
  dialog = setUp()
})

describe('focusableIn', () => {
  it('lists links, fields and enabled, visible buttons, in order', () => {
    expect(focusableIn(dialog).map((el) => el.id)).toEqual(['join', 'field', 'cancel', 'buy'])
  })
})

describe('keepTabInside', () => {
  it('wraps Tab from the last element to the first', () => {
    document.getElementById('buy')!.focus()
    const event = tab()
    keepTabInside(event, dialog)
    expect(focused()).toBe('join')
    expect(event.defaultPrevented).toBe(true)
  })

  it('wraps Shift+Tab from the first element to the last', () => {
    document.getElementById('join')!.focus()
    keepTabInside(tab(true), dialog)
    expect(focused()).toBe('buy')
  })

  it('leaves Tab alone in the middle, for the browser to move on', () => {
    document.getElementById('field')!.focus()
    const event = tab()
    keepTabInside(event, dialog)
    expect(focused()).toBe('field')
    expect(event.defaultPrevented).toBe(false)
  })

  it('brings focus back if it has left the dialog', () => {
    document.getElementById('behind')!.focus()
    keepTabInside(tab(), dialog)
    expect(focused()).toBe('join')
  })

  it('ignores other keys and a missing dialog', () => {
    document.getElementById('buy')!.focus()
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
    keepTabInside(enter, dialog)
    keepTabInside(tab(), null)
    expect(focused()).toBe('buy')
    expect(enter.defaultPrevented).toBe(false)
  })
})

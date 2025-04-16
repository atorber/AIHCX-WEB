import type { App } from 'vue/dist/vue.esm-bundler'
import { Icon } from './Icon'
import { BaseButton } from './Button'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('Icon', Icon)
  app.component('BaseButton', BaseButton)
}

// Augment HTMLElement to support the custom click-outside event handler
// used by the vClickOutside directive in AppHeader.vue
interface HTMLElement {
  _clickOutside: (e: MouseEvent) => void
}

export const getDescription = (label, prop, config = {}) => {
  return {
    label: $tl(label),
    prop,
    ...config
  }
}
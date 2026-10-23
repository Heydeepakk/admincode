// The four storefront racks. Must match garmentKind() in the storefront (components/wardrobe/cutout.js).
export const HANGERS = {
  tshirt: { label: 'T-shirt hanger', rack: 'T-Shirts & Tops', icon: '👕', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  lowers: { label: 'Clip hanger', rack: 'Lowers', icon: '🩳', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  jeans: { label: 'Jeans clamp hanger', rack: 'Jeans', icon: '👖', sizes: ['28', '30', '32', '34', '36', '38'] },
  underwear: { label: 'Mini clip hanger', rack: 'Underwear', icon: '🩲', sizes: ['S', 'M', 'L', 'XL', 'Free Size'] },
}

export const hangerOf = (category) => {
  const style = category?.hangerStyle
  if (style === 'top') return 'tshirt'
  if (style === 'bottom') return 'lowers'
  if (HANGERS[style]) return style
  const name = (category?.name || '').toLowerCase()
  if (/underwear|boxer|brief|trunk|innerwear|vest/.test(name)) return 'underwear'
  if (/jean|denim/.test(name) && !/shirt/.test(name)) return 'jeans'
  if (/shirt|tee|top|tank|polo|hoodie|jacket|sweat/.test(name)) return 'tshirt'
  if (/lower|pant|trouser|short|jogger|track|cargo|chino|bottom/.test(name)) return 'lowers'
  return 'tshirt'
}

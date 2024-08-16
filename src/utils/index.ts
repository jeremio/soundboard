import type { MySound } from '~/types/MySound'

export function assignEmptyCategory(sounds: MySound[]): MySound[] {
  return sounds.map((sound) => {
    if (sound.categories.length === 0) {
      sound.categories = ['sans catégorie']
    }
    return sound
  })
}

export function assignIds(sounds: MySound[]): MySound[] {
  return sounds.map((sound, index) => ({ ...sound, id: index }))
}

export function sortArrayByField<T>(
  array: T[],
  fieldName: keyof T,
): T[] {
  return array.slice().sort((a, b) => {
    const fieldA = a[fieldName]
    const fieldB = b[fieldName]

    // Gérer les valeurs null ou undefined
    if (fieldA == null && fieldB == null)
      return 0
    if (fieldA == null)
      return 1
    if (fieldB == null)
      return -1

    const valueA = typeof fieldA === 'string' ? fieldA.toLowerCase() : fieldA
    const valueB = typeof fieldB === 'string' ? fieldB.toLowerCase() : fieldB

    if (valueA < valueB)
      return -1
    if (valueA > valueB)
      return 1
    return 0
  })
}

export function getCategories(sounds: MySound[]): string[] {
  return Array.from(
    sounds.reduce((acc, sound: MySound) => {
      sound.categories.forEach((category: string) => acc.add(category))
      return acc
    }, new Set<string>()),
  )
}

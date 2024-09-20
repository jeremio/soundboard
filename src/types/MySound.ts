export interface MySound {
  id: number
  src: string
  label: string
  categories: string[]
}

export type MySoundWithoutId = Omit<MySound, 'id'>

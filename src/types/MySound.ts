import type { Category } from '~/types/Category'

export interface MySound {
  id: number
  src: string
  label: string
  categories: Category[]
}

export type MySoundWithoutId = Omit<MySound, 'id'>

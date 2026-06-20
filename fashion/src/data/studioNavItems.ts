import type { FC } from 'react'
import {
  HomeLine,
  Grid03,
  User01,
  Camera01,
  Move,
  VideoRecorder,
  Package,
  Scissors01,
  SwitchHorizontal01,
  LayoutGrid01,
  MagicWand01,
  RefreshCcw01,
  Image01,
} from '@untitledui/icons'
import type { NavItemType } from '@/components/application/app-navigation/config'
import { STUDIO_TOOLS } from './studioTools'

export type NavItemWithIcon = NavItemType & { icon: FC<{ className?: string }> }

const cekimTools = STUDIO_TOOLS.filter((t) => t.workspace === 'cekim')
const proTools = STUDIO_TOOLS.filter((t) => t.workspace === 'produksiyon')

const toolIconMap: Record<string, FC<{ className?: string }>> = {
  'cekim-model': User01,
  'cekim-editorial': Camera01,
  'cekim-pose': Move,
  'cekim-video': VideoRecorder,
  'pro-model': User01,
  'pro-tryon': Package,
  'pro-decoupe': Scissors01,
  'pro-swap': SwitchHorizontal01,
  'pro-editorial': Camera01,
  'pro-moodboard': LayoutGrid01,
  'pro-edit': MagicWand01,
  'pro-pose': Move,
  'pro-angle': RefreshCcw01,
  'pro-video': VideoRecorder,
}

export function buildStudioNavItems(_credits: number): NavItemWithIcon[] {
  return [
    {
      label: 'Home',
      href: '/',
      icon: HomeLine,
    },
    {
      label: 'Stüdyo',
      href: '/studio',
      icon: Grid03,
      items: [
        { label: 'Genel bakış', href: '/studio', icon: Grid03 },
        ...cekimTools.map((t) => ({
          label: t.label,
          href: `/studio?tool=${t.id}`,
          icon: toolIconMap[t.id] ?? User01,
          badge: t.isNew ? 'Yeni' : undefined,
        })),
      ],
    },
    {
      label: 'Galeri',
      href: '/gallery',
      icon: Image01,
    },
  ]
}

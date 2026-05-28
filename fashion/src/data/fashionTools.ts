import type { ElementType } from 'react'
import {
  User,
  Shirt,
  Aperture,
  Move,
  Video,
  Scissors,
  ArrowLeftRight,
  LayoutGrid,
  Wand2,
  Rotate3d,
} from 'lucide-react'
import type { NavItem } from '@/components/ui/dropdown-navigation'

export type FashionTool = {
  id: string
  label: string
  description: string
  icon: ElementType
  workspace: 'cekim' | 'produksiyon'
  isNew?: boolean
}

export const FASHION_TOOLS: FashionTool[] = [
  { id: 'cekim-model', label: 'Manken & Giyim', description: 'Model + Try-On tek akışta.', icon: User, workspace: 'cekim' },
  { id: 'cekim-editorial', label: 'Sahne', description: 'Editöryal sahne görseli.', icon: Aperture, workspace: 'cekim' },
  { id: 'cekim-pose', label: 'Poz', description: 'Hızlı poz varyasyonları.', icon: Move, workspace: 'cekim' },
  { id: 'cekim-video', label: 'Hareket', description: 'Sinematik video çıktısı.', icon: Video, workspace: 'cekim' },
  { id: 'pro-model', label: 'Model', description: 'Sanal model oluşturun.', icon: User, workspace: 'produksiyon' },
  { id: 'pro-tryon', label: 'Try-On', description: 'Kıyafeti modele giydirin.', icon: Shirt, workspace: 'produksiyon' },
  { id: 'pro-edit', label: 'Edit', description: 'Piksel düzeyinde düzenleme.', icon: Wand2, workspace: 'produksiyon', isNew: true },
  { id: 'pro-decoupe', label: 'Decoupe', description: 'Manken çıkar, ürünü öne çıkar.', icon: Scissors, workspace: 'produksiyon' },
  { id: 'pro-editorial', label: 'Editorial', description: 'Editöryal sahne üretin.', icon: Aperture, workspace: 'produksiyon' },
  { id: 'pro-moodboard', label: 'Moodboard', description: 'Kampanya moodboard.', icon: LayoutGrid, workspace: 'produksiyon', isNew: true },
  { id: 'pro-swap', label: 'Swap', description: 'Öğe ve stil değişimi.', icon: ArrowLeftRight, workspace: 'produksiyon', isNew: true },
  { id: 'pro-pose', label: 'Pose', description: 'Gelişmiş poz varyasyonları.', icon: Move, workspace: 'produksiyon', isNew: true },
  { id: 'pro-angle', label: 'Angle', description: 'Ön, arka, yan açılar.', icon: Rotate3d, workspace: 'produksiyon' },
  { id: 'pro-video', label: 'Video', description: 'Motion ve video üretimi.', icon: Video, workspace: 'produksiyon' },
]

export function getFashionTool(id: string) {
  return FASHION_TOOLS.find((t) => t.id === id)
}

export const CEKIM_NAV_ITEMS: NavItem[] = FASHION_TOOLS.filter((t) => t.workspace === 'cekim').map(
  (t, i) => ({
    id: i + 1,
    label: t.label,
  })
)

export const PRODUCTION_NAV_ITEMS: NavItem[] = [
  {
    id: 1,
    label: 'Üretim',
    subMenus: [
      {
        title: 'Araçlar',
        items: FASHION_TOOLS.filter((t) =>
          ['pro-model', 'pro-tryon', 'pro-decoupe', 'pro-swap'].includes(t.id)
        ).map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          icon: t.icon,
        })),
      },
    ],
  },
  {
    id: 2,
    label: 'Sahne & Stil',
    subMenus: [
      {
        title: 'Araçlar',
        items: FASHION_TOOLS.filter((t) =>
          ['pro-editorial', 'pro-moodboard', 'pro-edit'].includes(t.id)
        ).map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          icon: t.icon,
        })),
      },
    ],
  },
  {
    id: 3,
    label: 'Kompozisyon',
    subMenus: [
      {
        title: 'Araçlar',
        items: FASHION_TOOLS.filter((t) => ['pro-pose', 'pro-angle'].includes(t.id)).map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          icon: t.icon,
        })),
      },
    ],
  },
  {
    id: 4,
    label: 'Çıktı',
    subMenus: [
      {
        title: 'Araçlar',
        items: FASHION_TOOLS.filter((t) => t.id === 'pro-video').map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          icon: t.icon,
        })),
      },
    ],
  },
]

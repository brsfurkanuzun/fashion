import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { apiUrl, fetchToolPricingMap, getToolQualities } from '@/lib/api'
import { SITE_DOWNLOAD_PREFIX } from '@/lib/brand'
import {
  STUDIO_GLASS_CARD,
  STUDIO_GLASS_PANEL,
  STUDIO_UPLOAD_SHELL,
  StudioCreditSummary,
  StudioGenerateButton,
  StudioGlassDivider,
  StudioSegmentGrid,
} from '@/components/ui/studio-controls'
import {
  CheckCircle,
  ChevronDown,
  CircleHelp,
  Download,
  History,
  ImagePlus,
  Lock,
  Loader,
  Shuffle,
  Upload,
  X,
} from 'lucide-react'

const selectField = (label, value) => ({ type: 'select', label, value })
const sliderField = (label, value, min, max, current = value) => ({ type: 'slider', label, value, min, max, current })

function calcQualityCost(resolution, qualities = [], numImages = 1) {
  const row = qualities.find((q) => q.quality === resolution)
    ?? qualities.find((q) => q.quality === '2k')
  const base = row?.creditCost ?? 0
  return Math.round(base * Math.max(1, Number(numImages) || 1))
}

function resolveToolCreditCost(toolKey, pricingMap, { quality = '2k', multiplier = 1 } = {}) {
  return calcQualityCost(quality, pricingMap[toolKey] ?? [], multiplier)
}

const modelSections = [
  {
    id: 'identity',
    title: 'Kimlik',
    shuffleLabel: 'Kimlik Karıştır',
    help: true,
    columns: 3,
    fields: [selectField('Cinsiyet', 'Kadın'), selectField('Etnisite', 'Avrupalı'), selectField('Yaş', '18-24')],
  },
  {
    id: 'face',
    title: 'Yüz & Ten',
    shuffleLabel: 'Yüz Karıştır',
    help: true,
    columns: 2,
    fields: [
      selectField('Ten Rengi', 'Açık'),
      selectField('Yüz Tipi', 'Kemikli & Keskin'),
      selectField('Göz Rengi', 'Koyu Kahve'),
      selectField('İfade', 'Yumuşak Nötr'),
    ],
  },
  {
    id: 'hair',
    title: 'Saç',
    shuffleLabel: 'Saç Karıştır',
    columns: 2,
    fields: [selectField('Saç Rengi', 'Koyu Kahve'), selectField('Saç Stili', 'Geriye Taranmış')],
  },
  {
    id: 'body',
    title: 'Vücut',
    shuffleLabel: 'Vücut Karıştır',
    help: true,
    columns: 2,
    fields: [selectField('Beden', 'S'), sliderField('Boy', '175 cm', 155, 190, 175)],
  },
]

const tryOnSections = [
  {
    id: 'fit',
    title: 'Fit & Siluet',
    shuffleLabel: 'Fit Karıştır',
    columns: 2,
    fields: [selectField('Kalıp', 'Regular'), selectField('Duruş', 'Studio Straight'), selectField('Kumaş Akışı', 'Doğal'), selectField('Katman', 'Tek Ürün')],
  },
  {
    id: 'styling',
    title: 'Styling',
    help: true,
    columns: 2,
    fields: [selectField('Işık', 'Softbox'), selectField('Arka Plan', 'Soft Ivory'), selectField('Kadraj', '3/4'), selectField('Gölge', 'Doğal')],
  },
  {
    id: 'output',
    title: 'Çıktı',
    columns: 2,
    fields: [selectField('Detay Seviyesi', 'Kampanya'), selectField('Cilt Rötuşu', 'Doğal'), selectField('Ürün Koruması', 'Yüksek'), selectField('Doku Netliği', '1K')],
  },
]

const creativeSections = [
  {
    id: 'direction',
    title: 'Yaratıcı Yön',
    help: true,
    columns: 2,
    fields: [selectField('Mood', 'Luxury Minimal'), selectField('Renk Paleti', 'Champagne Noir'), selectField('Işık', 'Editorial Glow'), selectField('Tempo', 'Still Life')],
  },
  {
    id: 'scene',
    title: 'Sahne',
    shuffleLabel: 'Sahne Karıştır',
    columns: 2,
    fields: [selectField('Mekan', 'Studio Set'), selectField('Arka Plan', 'Textured Wall'), selectField('Prop Yoğunluğu', 'Düşük'), selectField('Derinlik', 'Orta')],
  },
  {
    id: 'framing',
    title: 'Kadraj',
    columns: 2,
    fields: [selectField('Lens', '50mm'), selectField('Açı', 'Front Hero'), selectField('Kompozisyon', 'Centered'), selectField('Çıktı Tipi', 'Campaign Still')],
  },
]

const fastEditorialSections = [
  {
    id: 'scene',
    title: 'Sahne',
    shuffleLabel: 'Sahne Karıştır',
    columns: 2,
    fields: [selectField('Mekan', 'Studio Set'), selectField('Arka Plan', 'Soft Stone'), selectField('Işık', 'Editorial Glow'), selectField('Kadraj', 'Hero')],
  },
  {
    id: 'style',
    title: 'Stil',
    help: true,
    columns: 2,
    fields: [selectField('Mood', 'Luxury Minimal'), selectField('Renk Paleti', 'Champagne Noir'), selectField('Tempo', 'Still Life'), selectField('Çıktı Tipi', 'Campaign Still')],
  },
]

const fastPoseSections = [
  {
    id: 'pose',
    title: 'Poz',
    shuffleLabel: 'Poz Karıştır',
    columns: 2,
    fields: [selectField('Poz Tipi', 'Confident'), selectField('Bakış', 'Kamera'), selectField('Duruş', '3/4 Turn'), selectField('Enerji', 'Soft Motion')],
  },
  {
    id: 'framing',
    title: 'Kadraj',
    help: true,
    columns: 2,
    fields: [selectField('Kadraj', 'Waist Up'), selectField('Ürün Odağı', 'High'), selectField('Arka Plan', 'Muted Studio'), selectField('Çıktı', 'Lookbook')],
  },
]

const poseSections = [
  {
    id: 'pose',
    title: 'Poz',
    shuffleLabel: 'Poz Karıştır',
    columns: 2,
    fields: [selectField('Pose Ailesi', 'Confident'), selectField('El Kullanımı', 'One Hand Detail'), selectField('Omuz Açısı', '3/4 Turn'), selectField('Bakış', 'Kamera')],
  },
  {
    id: 'expression',
    title: 'İfade',
    columns: 2,
    fields: [selectField('İfade', 'Soft Neutral'), selectField('Enerji', 'Calm'), selectField('Yüz Açısı', 'Slight Left'), selectField('Kadraj', 'Waist Up')],
  },
  {
    id: 'stability',
    title: 'Denge',
    help: true,
    columns: 2,
    fields: [selectField('Ağırlık Dağılımı', 'Balanced'), selectField('Ürün Odağı', 'High'), selectField('Arkaplan', 'Muted Studio'), selectField('Çıktı', 'Lookbook')],
  },
]

const angleSections = [
  {
    id: 'camera',
    title: 'Kamera',
    shuffleLabel: 'Açı Karıştır',
    columns: 2,
    fields: [selectField('Ana Açı', 'Front'), selectField('İkincil Açı', 'Side 45'), selectField('Lens', '70mm'), selectField('Perspektif', 'Doğal')],
  },
  {
    id: 'rotation',
    title: 'Rotasyon',
    columns: 2,
    fields: [selectField('Yön', 'Saat Yönü'), selectField('Adım', '15°'), selectField('Ürün Sabitleme', 'Açık'), selectField('Gölge Koruma', 'Yüksek')],
  },
  {
    id: 'delivery',
    title: 'Teslim',
    columns: 2,
    fields: [selectField('Set Türü', 'E-commerce'), selectField('Çıktı Sayısı', '4 açı'), selectField('Arkaplan', 'Pure White'), selectField('Kesim Payı', 'Otomatik')],
  },
]

const editSections = [
  {
    id: 'retouch',
    title: 'Retouch',
    shuffleLabel: 'Edit Reçetesi',
    columns: 2,
    fields: [selectField('Görev', 'Skin Cleanup'), selectField('Yoğunluk', 'Orta'), selectField('Maske Hassasiyeti', 'Yüksek'), selectField('Keskinlik', 'Doğal')],
  },
  {
    id: 'light',
    title: 'Işık & Ton',
    columns: 2,
    fields: [selectField('Exposure', '+0.3'), selectField('Kontrast', 'Soft S-Curve'), selectField('Highlight', 'Korunmuş'), selectField('White Balance', 'Neutral Warm')],
  },
  {
    id: 'finish',
    title: 'Final',
    help: true,
    columns: 2,
    fields: [selectField('Output', 'Social + PDP'), selectField('Noise Cleanup', 'Açık'), selectField('Color Lock', 'Açık'), selectField('Version', 'Master')],
  },
]

const motionSections = [
  {
    id: 'motion',
    title: 'Hareket',
    shuffleLabel: 'Motion Karıştır',
    columns: 2,
    fields: [selectField('Hareket Tipi', 'Slow Walk'), selectField('Kamera', 'Parallax'), selectField('Loop', 'Kapalı'), selectField('Enerji', 'Editorial')],
  },
  {
    id: 'timing',
    title: 'Timing',
    columns: 2,
    fields: [selectField('Süre', '6 sn'), selectField('FPS', '24'), selectField('Giriş', 'Ease Out'), selectField('Çıkış', 'Ease In')],
  },
  {
    id: 'delivery',
    title: 'Teslim',
    columns: 2,
    fields: [selectField('Format', 'MP4'), selectField('Boyut', '1080 x 1350'), selectField('Ses', 'Kapalı'), selectField('Kapak Kare', 'Oto')],
  },
]

const videoSections = [
  {
    id: 'motion',
    title: 'Hareket',
    shuffleLabel: 'Motion Karıştır',
    columns: 2,
    fields: [selectField('Hareket Tipi', 'Slow Walk'), selectField('Kamera', 'Parallax'), selectField('Enerji', 'Editorial'), selectField('Geçiş', 'Soft Fade')],
  },
  {
    id: 'timing',
    title: 'Zamanlama',
    columns: 2,
    fields: [selectField('Süre', '6 sn'), selectField('FPS', '24'), selectField('Format', '9:16 Reel'), selectField('Kalite', 'Video 4K')],
  },
]

const decoupeSections = [
  {
    id: 'cutout',
    title: 'Kesim',
    shuffleLabel: 'Mask Karıştır',
    columns: 2,
    fields: [selectField('Kenar Hassasiyeti', 'Yüksek'), selectField('Saç Detayı', 'Korunmuş'), selectField('Gölge', 'Soft Shadow'), selectField('Zemin', 'Şeffaf')],
  },
  {
    id: 'product',
    title: 'Ürün Sunumu',
    columns: 2,
    fields: [selectField('Merkezleme', 'Otomatik'), selectField('Kadraj', 'PDP Ready'), selectField('Arka Plan', 'Pure White'), selectField('Yansıma', 'Kapalı')],
  },
  {
    id: 'delivery',
    title: 'Format',
    columns: 2,
    fields: [selectField('Çıktı', 'PNG'), selectField('Canvas', '2048 px'), selectField('Margin', '8%'), selectField('Versiyon', 'Packshot')],
  },
]

const swapSections = [
  {
    id: 'swap',
    title: 'Değişim',
    shuffleLabel: 'Swap Karıştır',
    columns: 2,
    fields: [selectField('Hedef Bölge', 'Üst Giyim'), selectField('Swap Tipi', 'Style Match'), selectField('Yapı Koruma', 'Yüksek'), selectField('Kenar Uyum', 'Doğal')],
  },
  {
    id: 'context',
    title: 'Çevre',
    columns: 2,
    fields: [selectField('Arka Plan', 'Korunmuş'), selectField('Işık', 'Kaynakla Eşleştir'), selectField('Gölgeler', 'Korunmuş'), selectField('Ton Eşleme', 'Açık')],
  },
  {
    id: 'quality',
    title: 'Kalite',
    columns: 2,
    fields: [selectField('Doku', 'Kumaş Öncelikli'), selectField('Renk', 'Brand Locked'), selectField('Versiyon', 'V2 Beta'), selectField('Output', 'Campaign Still')],
  },
]

const moodboardSections = [
  {
    id: 'theme',
    title: 'Tema',
    shuffleLabel: 'Tema Karıştır',
    columns: 2,
    fields: [selectField('Estetik', 'Quiet Luxury'), selectField('Sezon', 'SS26'), selectField('Renk', 'Stone & Sand'), selectField('Enerji', 'Refined')],
  },
  {
    id: 'composition',
    title: 'Kompozisyon',
    columns: 2,
    fields: [selectField('Grid', 'Editorial Grid'), selectField('Kart Sayısı', '6'), selectField('Tipografi', 'Minimal Serif'), selectField('Materyal', 'Mixed Media')],
  },
  {
    id: 'delivery',
    title: 'Teslim',
    columns: 2,
    fields: [selectField('Boyut', 'Landscape'), selectField('Sunum', 'Pitch Ready'), selectField('Notlar', 'Açık'), selectField('Versiyon', 'Brand v1')],
  },
]

const TOOL_CONFIGS = {
  'cekim-model': {
    title: 'Hızlı Manken & Giyim',
    subtitle: 'Tek adımda model ve ürün eşleştirme',
    uploads: [
      { label: 'Ürün', action: 'Ürün fotoğrafı yükle', badge: 'ÖRNEK' },
      { label: 'Model Referansı', action: 'Model referansı seç', badge: 'FAST' },
    ],
    sections: modelSections,
    cameraFrames: ['Full', '3/4', 'Üst', 'Ürün'],
    quality: 'Fast 2K',
    cost: '40 kredi',
    previewTitle: 'Hızlı lookbook önizlemesi',
    previewNote: 'Tek shot içinde model, ürün ve ışık ayarlarının demo birleşimi.',
  },
  'cekim-editorial': {
    title: 'Sahne Oluşturucu',
    subtitle: 'Hızlı editöryal kompozisyon üretimi',
    uploads: [
      { label: 'Ana Ürün', action: 'Ürün görseli ekle', badge: 'ÖRNEK' },
      { label: 'Mood Referansı', action: 'Mood referansı yükle', badge: 'REF' },
    ],
    sections: fastEditorialSections,
    quality: 'Fast Editorial',
    cost: '55 kredi',
    previewTitle: 'Editöryal sahne denemesi',
    previewNote: 'Mekan, ışık ve kompozisyon kararlarını tek kampanya karesinde gösterir.',
    showGuide: false,
    showCameraFrames: false,
    showAdditionalSettings: false,
    showHistory: false,
  },
  'cekim-pose': {
    title: 'Poz Yönlendirici',
    subtitle: 'Hızlı poz varyasyon seti',
    uploads: [
      { label: 'Referans Model', action: 'Referans görseli ekle', badge: 'ÖRNEK' },
      { label: 'Ürün', action: 'Ürün bağlantısı ekle', badge: 'LOOK' },
    ],
    sections: fastPoseSections,
    quality: 'Fast Pose',
    cost: '30 kredi',
    previewTitle: 'Poz varyasyon önizlemesi',
    previewNote: 'Poz, ifade ve ürün odağını dengeler.',
    showGuide: false,
    showCameraFrames: false,
    showAdditionalSettings: false,
    showHistory: false,
  },
  'cekim-video': {
    title: 'Hızlı Motion',
    subtitle: 'Kısa sinematik ürün videosu',
    uploads: [
      { label: 'Kaynak Görsel', action: 'Ana görseli yükle', badge: 'ÖRNEK' },
      { label: 'Motion Referansı', action: 'Video referansı ekle', badge: 'CLIP' },
    ],
    sections: motionSections,
    cameraFrames: ['Portrait', 'Reel', 'Square', 'Story'],
    quality: 'Motion 1080',
    cost: '80 kredi',
    previewTitle: 'Motion storyboard önizlemesi',
    previewNote: 'Kamera hareketi, tempo ve teslim formatını önden simüle eder.',
    showGuide: false,
    showCameraFrames: false,
    showAdditionalSettings: false,
    showHistory: false,
  },
  'pro-model': {
    title: 'Model Özelleştirme',
    subtitle: 'Gelişmiş AI model oluşturucu',
    uploads: [
      { label: 'Ürünler', action: 'Kendi ürününü yükle', badge: 'ÖRNEK' },
      { label: 'Arka Plan (Opsiyonel)', locked: true, lockedBadge: 'PRO', lockedText: 'Creator paketi ve üzeri gereklidir' },
    ],
    sections: modelSections,
    cameraFrames: ['Full', '3/4', 'Üst', 'Ürün'],
    quality: 'V4 1K',
    cost: '150 kredi',
    previewTitle: 'Kampanya hazır model önizlemesi',
    previewNote: 'Kimlik, saç, yüz ve beden ayarlarının birleşik demosu.',
  },
  'pro-tryon': {
    title: 'Try-On Studio',
    subtitle: 'Kıyafeti modele kusursuz yerleştirin',
    uploads: [
      { label: 'Ürünler', action: 'Ürün fotoğrafı yükle', badge: 'ÖRNEK' },
      { label: 'Model Referansı', action: 'Model görseli ekle', badge: 'MODEL' },
      { label: 'Arka Plan (Opsiyonel)', locked: true, lockedBadge: 'PRO', lockedText: 'Gelişmiş sahne kontrolü için Creator gerekir' },
    ],
    sections: tryOnSections,
    cameraFrames: ['Full', '3/4', 'Waist', 'Detail'],
    quality: 'Try-On Pro',
    cost: '120 kredi',
    previewTitle: 'Try-On sonuç önizlemesi',
    previewNote: 'Ürün yerleşimi, kumaş akışı ve model eşleşmesi ön izlemesi.',
  },
  'pro-decoupe': {
    title: 'Decoupe Studio',
    subtitle: 'Ürünü temizce ayırın ve sunuma hazırlayın',
    uploads: [
      { label: 'Ürün', action: 'Packshot yükle', badge: 'PDP' },
    ],
    sections: decoupeSections,
    cameraFrames: ['Front', 'Square', 'Detail', 'Pack'],
    quality: 'Cutout Master',
    cost: '45 kredi',
    previewTitle: 'Packshot çıktı önizlemesi',
    previewNote: 'Mask, gölge ve white background optimizasyonu gösterilir.',
  },
  'pro-swap': {
    title: 'Swap Studio',
    subtitle: 'Öğe ve stil değişimini kontrollü yapın',
    uploads: [
      { label: 'Kaynak', action: 'Kaynak görseli yükle', badge: 'SRC' },
      { label: 'Hedef Öğe', action: 'Hedef ürünü yükle', badge: 'NEW' },
    ],
    sections: swapSections,
    cameraFrames: ['Scene', 'Hero', 'Detail', 'Story'],
    quality: 'Swap Beta',
    cost: '90 kredi',
    previewTitle: 'Swap deneme önizlemesi',
    previewNote: 'Yeni ürün, orijinal ışık ve bağlam korunarak yerleştirilir.',
  },
  'pro-editorial': {
    title: 'Editorial Studio',
    subtitle: 'Editöryal set ve sahne kompozisyonu',
    uploads: [
      { label: 'Ana Ürün', action: 'Ana ürünü ekle', badge: 'HERO' },
      { label: 'Referans Mood', action: 'Moodboard yükle', badge: 'REF' },
    ],
    sections: creativeSections,
    cameraFrames: ['Hero', 'Wide', 'Story', 'Detail'],
    quality: 'Editorial 4K',
    cost: '110 kredi',
    previewTitle: 'Editorial sahne önizlemesi',
    previewNote: 'Sahne, ışık ve prop yoğunluğu ile kampanya dili kurulur.',
  },
  'pro-moodboard': {
    title: 'Moodboard Composer',
    subtitle: 'Kampanya ve koleksiyon anlatısını kurun',
    uploads: [
      { label: 'İlham Görselleri', action: 'Referansları yükle', badge: 'BOARD' },
      { label: 'Marka Renkleri', action: 'Palette ekle', badge: 'BRAND' },
    ],
    sections: moodboardSections,
    cameraFrames: ['Landscape', 'Grid', 'Story', 'Deck'],
    quality: 'Board Pro',
    cost: '65 kredi',
    previewTitle: 'Moodboard önizlemesi',
    previewNote: 'Tema, renk ve yerleşim dili tek panelde toplanır.',
  },
  'pro-edit': {
    title: 'Edit Workspace',
    subtitle: 'Piksel düzeyinde ürün ve model düzenleme',
    uploads: [
      { label: 'Kaynak Görsel', action: 'Ana görseli yükle', badge: 'RAW' },
      { label: 'Maske Referansı', action: 'Maske referansı ekle', badge: 'MASK' },
    ],
    sections: editSections,
    cameraFrames: ['Full', 'Detail', 'Portrait', 'Square'],
    quality: 'Retouch Master',
    cost: '95 kredi',
    previewTitle: 'Edit önizlemesi',
    previewNote: 'Ton, retouch ve final export ayarlarının kontrollü demosu.',
  },
  'pro-pose': {
    title: 'Pose Director',
    subtitle: 'Gelişmiş duruş ve ifade varyasyonları',
    uploads: [
      { label: 'Model', action: 'Model referansı yükle', badge: 'MODEL' },
      { label: 'Ürün', action: 'Look referansı ekle', badge: 'LOOK' },
    ],
    sections: poseSections,
    cameraFrames: ['Full', '3/4', 'Waist', 'Face'],
    quality: 'Pose Pro',
    cost: '70 kredi',
    previewTitle: 'Pose direction önizlemesi',
    previewNote: 'Duruş, ifade ve ürün vurgusunu aynı akışta dengeler.',
  },
  'pro-angle': {
    title: 'Angle Generator',
    subtitle: 'Ön, arka ve yan açı setleri',
    uploads: [
      { label: 'Kaynak Ürün', action: 'Ürün görseli yükle', badge: 'PDP' },
      { label: 'Açı Referansı', action: 'Referans açı ekle', badge: 'ANGLE' },
    ],
    sections: angleSections,
    cameraFrames: ['Front', 'Side', 'Back', 'Detail'],
    quality: 'Angle 4 Set',
    cost: '60 kredi',
    previewTitle: 'Açı seti önizlemesi',
    previewNote: 'Farklı açılar arasında ürün oranı ve gölge tutarlılığı korunur.',
  },
  'pro-video': {
    title: 'Video Generator',
    subtitle: 'Motion ve video üretimi',
    uploads: [
      { label: 'Ana Görsel', action: 'Ana kareyi yükle', badge: 'KEY' },
      { label: 'Storyboard', action: 'Storyboard ekle', badge: 'SHOT' },
    ],
    sections: videoSections,
    quality: 'Video 4K',
    cost: '180 kredi',
    previewTitle: 'Video shot preview',
    previewNote: 'Sahne ritmi, kamera yolu ve çıktı formatı önceden kurgulanır.',
    showCameraFrames: false,
    showAdditionalSettings: false,
    showHistory: false,
  },
}

function getColumnClass(columns) {
  if (columns === 3) return 'grid-cols-1 sm:grid-cols-3'
  if (columns === 4) return 'grid-cols-2 sm:grid-cols-4'
  return 'grid-cols-1 sm:grid-cols-2'
}

function getSliderFill(field) {
  const range = field.max - field.min
  if (!range) return 0
  return ((field.current - field.min) / range) * 100
}

function SelectField({ field }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] tracking-[-0.01em] text-muted">{field.label}</label>
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 text-left text-[12px] tracking-[-0.01em] text-ink transition-colors hover:bg-[var(--card-bg-hover)] dark:border-white/[0.08] dark:text-white"
      >
        <span>{field.value}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
    </div>
  )
}

function SliderField({ field }) {
  const fill = getSliderFill(field)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] tracking-[-0.01em] text-muted">
        <span>{field.label}</span>
        <span>{field.value}</span>
      </div>
      <div className="relative mt-3 h-[6px] w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--champagne),rgba(122,107,88,0.45))] dark:bg-[linear-gradient(90deg,var(--champagne),rgba(232,220,200,0.55))]"
          style={{ width: `${fill}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/60 bg-[var(--elevated)] shadow-[0_4px_12px_rgba(0,0,0,0.14)] dark:border-white/15"
          style={{ left: `calc(${fill}% - 8px)` }}
        />
      </div>
    </div>
  )
}

function UploadCard({ item, toolLabel, preview, onFileChange, compact = false }) {
  const inputRef = useRef(null)

  const handleClick = () => {
    if (!item.locked) inputRef.current?.click()
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onFileChange?.(item.label, reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onFileChange?.(item.label, null)
  }

  return (
    <div className={`${STUDIO_UPLOAD_SHELL} ${compact ? 'min-w-[180px] flex-1 sm:max-w-[220px]' : ''}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.05em] text-muted">{item.label}</label>
        {!item.locked && <CircleHelp size={13} className="text-subtle" />}
        {item.locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-500">
            <Lock size={10} />
            {item.lockedBadge ?? 'PRO'}
          </span>
        )}
        {preview && (
          <button type="button" onClick={handleClear} className="ml-auto text-muted hover:text-ink transition-colors">
            <X size={12} />
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleChange} />

      {item.locked ? (
        <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.08] bg-[var(--card-bg)] px-4 text-center dark:border-white/[0.08] ${compact ? 'h-24' : 'h-24'}`}>
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.04] text-muted dark:bg-white/[0.05]">
            <Lock size={14} />
          </div>
          <p className="text-[11px] text-muted">{item.lockedText}</p>
        </div>
      ) : preview ? (
        <button type="button" onClick={handleClick} className="group relative w-full overflow-hidden rounded-2xl border border-black/[0.05] dark:border-white/[0.08]">
          <img src={preview} alt={item.label} className={`w-full object-cover ${compact ? 'h-24' : 'h-28'}`} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--elevated)] px-2.5 py-1 text-[10px] font-medium text-ink shadow-sm dark:bg-[#171717] dark:text-white">
              <Upload size={12} />
              Değiştir
            </span>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="group relative w-full overflow-hidden rounded-xl border border-dashed border-champagne/20 bg-[linear-gradient(135deg,rgba(122,107,88,0.12),transparent_55%)] transition-all duration-200 hover:border-champagne/35 dark:border-[#e8dcc8]/20 dark:bg-[linear-gradient(135deg,rgba(232,220,200,0.08),transparent_55%)] dark:hover:border-[#e8dcc8]/35"
        >
          <div className={`flex w-full items-center gap-3 bg-[var(--card-bg)]/30 px-3 text-left ${compact ? 'h-24' : 'h-28 flex-col justify-center px-4 text-center'}`}>
            <div className={`absolute left-2 top-2 rounded-full bg-[var(--elevated)] px-2 py-0.5 text-[9px] font-medium tracking-[0.08em] text-ink dark:bg-white/90 dark:text-black ${compact ? '' : ''}`}>
              {item.badge ?? 'ÖRNEK'}
            </div>
            <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] text-champagne shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-white/[0.06] ${compact ? 'h-11 w-11' : 'h-10 w-10'}`}>
              <ImagePlus size={compact ? 16 : 18} />
            </div>
            <div className={compact ? 'min-w-0 flex-1 pr-1' : ''}>
              {!compact && <p className="text-[12px] font-medium text-ink dark:text-white">{toolLabel}</p>}
              <p className={`text-muted ${compact ? 'text-[10px] leading-snug' : 'mt-1 text-[10px]'}`}>{item.action}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/10 group-hover:opacity-100 dark:group-hover:bg-black/20">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--elevated)] px-2.5 py-1 text-[10px] font-medium text-ink shadow-sm dark:bg-[#171717] dark:text-white">
                <Upload size={12} />
                Yükle
              </span>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

function SectionBlock({ section, open, onToggle }) {
  return (
    <div className="rounded-2xl border border-black/[0.05] px-3 dark:border-white/[0.06]">
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-left">
            <span className="text-[10px] uppercase tracking-[0.05em] text-muted transition-colors hover:text-ink dark:hover:text-white">
              {section.title}
            </span>
            <ChevronDown size={16} className={`text-subtle transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {section.help && <CircleHelp size={13} className="text-subtle" />}
        </div>

        {section.shuffleLabel && (
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.05] bg-[var(--card-bg)] text-muted transition-colors hover:text-ink dark:border-white/[0.08] dark:hover:text-white"
            title={section.shuffleLabel}
          >
            <Shuffle size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className={`grid gap-2 border-t border-black/[0.05] pb-3 pt-3 dark:border-white/[0.06] ${getColumnClass(section.columns)}`}>
          {section.fields.map((field) =>
            field.type === 'slider' ? <SliderField key={field.label} field={field} /> : <SelectField key={field.label} field={field} />
          )}
        </div>
      )}
    </div>
  )
}

function buildFashnInputs(toolId, uploadedFiles, prompt, tryonParams) {
  const f = uploadedFiles || {}
  const firstFile = Object.values(f)[0] || ''
  const p = prompt || ''

  switch (toolId) {
    case 'cekim-model':
      return {
        model_image: f['Model Görseli'] || '',
        garment_image: f['Kıyafet Görseli'] || '',
        category: tryonParams?.category ?? 'auto',
        mode: tryonParams?.mode ?? 'balanced',
        garment_photo_type: tryonParams?.garment_photo_type ?? 'auto',
        moderation_level: tryonParams?.moderation_level ?? 'permissive',
        num_samples: tryonParams?.num_samples ?? 1,
        segmentation_free: tryonParams?.segmentation_free ?? true,
        output_format: tryonParams?.output_format ?? 'png',
        ...(tryonParams?.seed ? { seed: tryonParams.seed } : {}),
      }
    case 'pro-tryon': {
      const tp = tryonParams // reused as tryonMaxParams via sharedProps
      return {
        product_image: f['Ürün Görseli'] || '',
        model_image: f['Model Görseli'] || '',
        ...(tp?.prompt ? { prompt: tp.prompt } : {}),
        resolution: tp?.resolution ?? '1k',
        generation_mode: tp?.generation_mode ?? 'balanced',
        num_images: tp?.num_images ?? 1,
        output_format: tp?.output_format ?? 'png',
        ...(tp?.seed ? { seed: Number(tp.seed) } : {}),
      }
    }
    case 'pro-decoupe': {
      const pp = tryonParams
      return {
        product_image: f['Ürün'] || '',
        resolution: pp?.resolution ?? '1k',
      }
    }
    case 'pro-model':
      return { prompt: p || 'professional fashion model studio photography' }
    case 'pro-swap': {
      const sp = tryonParams
      return {
        model_image: f['Sahne Görseli'] || '',
        product_image: f['Ürün Görseli'] || '',
        resolution: sp?.resolution ?? '1k',
        generation_mode: sp?.generation_mode ?? 'balanced',
        output_format: sp?.output_format ?? 'png',
        ...(p ? { prompt: p } : {}),
      }
    }
    case 'cekim-video':
    case 'pro-video':
      return { image: firstFile }
    case 'cekim-editorial':
    case 'cekim-pose':
    case 'pro-edit':
    case 'pro-pose':
    case 'pro-angle':
    case 'pro-editorial':
    case 'pro-moodboard':
    default:
      return { image: firstFile, prompt: p || 'editorial fashion scene' }
  }
}

const STUDIO_RESULTS_PANEL_CLASS = `${STUDIO_GLASS_PANEL} flex min-h-[640px] flex-col p-4 sm:p-5`
const STUDIO_RESULTS_VIEWPORT_CLASS =
  'relative w-full overflow-hidden rounded-[1.4rem] border border-black/[0.06] aspect-[16/9] min-h-[360px] bg-gradient-to-br from-black/[0.02] to-transparent shadow-inner sm:min-h-[420px] dark:border-white/[0.08] dark:from-white/[0.03]'

function StudioToolShell({ results, settings }) {
  return (
    <div className="w-full px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-6">
        {results}
        {settings}
      </div>
    </div>
  )
}

function StudioWideResultsPanel({ headerExtra, children, footer }) {
  return (
    <StudioResultsPanel className="w-full min-h-[520px]" headerExtra={headerExtra} footer={footer}>
      {children}
    </StudioResultsPanel>
  )
}

function StudioSettingsPanel({ title = 'Ayarlar', children, footer }) {
  return (
    <div className={STUDIO_GLASS_PANEL}>
      <div className="border-b border-black/[0.06] px-5 py-3.5 dark:border-white/[0.08]">
        <div className="section-label">{title}</div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {footer ? (
        <div className="border-t border-black/[0.06] bg-black/[0.015] px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-5">
          <StudioGlassDivider />
          <div className="mt-4">{footer}</div>
        </div>
      ) : null}
    </div>
  )
}

function StudioSettingsColumns({ uploads, controls, aside }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
      {uploads ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:max-w-[440px] xl:shrink-0">
          {uploads}
        </div>
      ) : null}
      {controls ? (
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-stretch">
            {controls}
          </div>
        </div>
      ) : null}
      {aside ? <div className="flex w-full flex-col gap-3 md:w-[240px] md:shrink-0 xl:w-[220px]">{aside}</div> : null}
    </div>
  )
}

function StudioControlCard({ title, help, action, children, className = '' }) {
  return (
    <div className={`${STUDIO_GLASS_CARD} min-w-[200px] flex-1 ${className}`.trim()}>
      {(title || action) && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {title ? <span className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">{title}</span> : null}
            {help ? <CircleHelp size={12} className="text-subtle" /> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

function StudioGenerateBar({
  qualityLabel,
  creditCost,
  credits,
  onGenerate,
  isGenerating,
  jobMessage,
  disabled = false,
  buttonText,
}) {
  const lowBalance = typeof creditCost === 'number' && credits < creditCost

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StudioCreditSummary
          qualityLabel={qualityLabel}
          creditCost={creditCost}
          credits={credits}
          lowBalance={lowBalance}
        />
        <StudioGenerateButton onClick={onGenerate} disabled={disabled} isGenerating={isGenerating}>
          {buttonText ?? `${creditCost} kredi · Oluştur`}
        </StudioGenerateButton>
      </div>
      {jobMessage ? <p className="mt-2 text-[11px] text-muted">{jobMessage}</p> : null}
    </>
  )
}

function StudioResultsPanel({ headerExtra, children, footer, className = '' }) {
  return (
    <div className={`${STUDIO_RESULTS_PANEL_CLASS} ${className}`.trim()}>
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h3 className="text-[13px] font-medium tracking-[-0.01em] text-muted">Sonuçlar</h3>
        {headerExtra}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      {footer ? <div className="mt-4 shrink-0">{footer}</div> : null}
    </div>
  )
}

function StudioResultsViewport({ children, className = '' }) {
  return <div className={`${STUDIO_RESULTS_VIEWPORT_CLASS} ${className}`.trim()}>{children}</div>
}

function ResultImages({ images, isGenerating, tool, viewportClassName = '' }) {
  if (isGenerating) {
    return (
      <StudioResultsViewport className={`flex items-center justify-center ${viewportClassName}`.trim()}>
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader size={28} className="animate-spin text-champagne" />
          <p className="text-[12px] tracking-tight">Üretiliyor...</p>
        </div>
      </StudioResultsViewport>
    )
  }

  if (images && images.length > 0) {
    return (
      <StudioResultsViewport className={viewportClassName}>
        <div className={`grid h-full w-full ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.map((url, i) => (
            <div key={url} className="group relative h-full min-h-0 overflow-hidden">
              <img src={url} alt={`Sonuç ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(url)
                      const blob = await res.blob()
                      const blobUrl = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = blobUrl
                      a.download = `${SITE_DOWNLOAD_PREFIX}-${tool.id}-${i + 1}.jpg`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
                    } catch {
                      window.open(url, '_blank')
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-[11px] text-white backdrop-blur"
                >
                  <Download size={12} />
                  İndir
                </button>
              </div>
              {i === 0 && (
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-medium text-white">
                  <CheckCircle size={10} />
                  Tamamlandı
                </div>
              )}
            </div>
          ))}
        </div>
      </StudioResultsViewport>
    )
  }

  return null
}

function ResultPreview({ tool, config, isGenerating, resultImages, viewportClassName = '' }) {
  const ToolIcon = tool.icon

  if (isGenerating || (resultImages && resultImages.length > 0)) {
    return <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} viewportClassName={viewportClassName} />
  }

  return (
    <StudioResultsViewport className={viewportClassName}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%), linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.12) 100%)',
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-full bg-[var(--elevated)] px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-ink shadow-sm dark:bg-white/90 dark:text-black">
            ÖRNEK
          </span>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-[var(--elevated)] text-champagne shadow-sm dark:border-white/[0.08] dark:bg-[#141414]">
            <ToolIcon size={18} />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-black/[0.06] bg-[var(--card-bg)] text-champagne shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <ToolIcon size={42} strokeWidth={1.4} />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.05] bg-[var(--elevated)]/75 p-3 backdrop-blur dark:border-white/[0.08] dark:bg-black/15">
          <p className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">Çıktı</p>
          <h3 className="mt-1 text-sm font-medium tracking-[-0.02em] text-ink dark:text-white">{config.previewTitle}</h3>
          <p className="mt-1 text-[11px] leading-5 text-muted">{config.previewNote}</p>
        </div>
      </div>
    </StudioResultsViewport>
  )
}

function FastSectionCard({ section, horizontal = true }) {
  return (
    <StudioControlCard
      title={section.title}
      help={section.help}
      action={
        section.shuffleLabel ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.05] bg-[var(--card-bg)] text-muted transition-colors hover:text-ink dark:border-white/[0.08] dark:hover:text-white"
            title={section.shuffleLabel}
          >
            <Shuffle size={12} />
          </button>
        ) : null
      }
    >
      <div className={`grid gap-2 ${horizontal ? 'grid-cols-2 xl:grid-cols-4' : getColumnClass(section.columns)}`}>
        {section.fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-black/[0.05] bg-[var(--card-bg)]/80 px-3 py-2 transition-all duration-200 hover:border-champagne/25 hover:bg-[var(--card-bg)] dark:border-white/[0.06] dark:hover:border-[#e8dcc8]/20"
          >
            <p className="text-[10px] tracking-[-0.01em] text-muted">{field.label}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate text-[12px] font-medium tracking-[-0.01em] text-ink dark:text-white">{field.value}</span>
              <ChevronDown size={13} className="shrink-0 text-subtle" />
            </div>
          </div>
        ))}
      </div>
    </StudioControlCard>
  )
}

function FastExpressWorkspace({ tool, config, credits, creditCost, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, promptText, onPromptChange }) {
  const isVideo = tool.id === 'cekim-video'
  const flowSteps = isVideo
    ? ['Kaynak görseli yükle', 'Motion ve tempo seç', 'Kısa video çıktısı al']
    : tool.id === 'cekim-editorial'
      ? ['Ürünü yükle', 'Sahne ve stil seç', 'Tek kare sonucu al']
      : ['Referans modeli ekle', 'Poz ve kadraj seç', 'Lookbook karesini üret']

  const settingsPanel = (
    <StudioSettingsPanel
      footer={(
        <StudioGenerateBar
          qualityLabel={config.quality}
          creditCost={creditCost}
          credits={credits}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          jobMessage={jobMessage}
        />
      )}
    >
      <StudioSettingsColumns
        uploads={config.uploads.map((item) => (
          <UploadCard
            key={item.label}
            compact
            item={item}
            toolLabel={tool.label}
            preview={uploadedFiles?.[item.label]}
            onFileChange={onFileChange}
          />
        ))}
        controls={config.sections.map((section) => (
          <FastSectionCard key={section.id} section={section} />
        ))}
        aside={(
          <>
            <StudioControlCard title="Prompt">
              <textarea
                value={promptText}
                onChange={(e) => onPromptChange?.(e.target.value)}
                placeholder="Stil yönlendirmesi yazın..."
                rows={4}
                className="w-full resize-none rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
              />
            </StudioControlCard>
            <StudioControlCard title="Hızlı Akış">
              <div className="flex flex-wrap gap-2">
                {flowSteps.map((item, index) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-champagne/15 bg-[var(--card-bg)]/80 px-2.5 py-1 text-[10px] text-muted backdrop-blur-sm dark:border-[#e8dcc8]/15"
                  >
                    <span className="font-medium text-champagne">{index + 1}</span>
                    {item}
                  </span>
                ))}
              </div>
            </StudioControlCard>
          </>
        )}
      />
    </StudioSettingsPanel>
  )

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          headerExtra={
            resultImages.length > 0 ? (
              <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">
                Galeride Gör
              </Link>
            ) : null
          }
        >
          <ResultPreview tool={tool} config={config} isGenerating={isGenerating} resultImages={resultImages} />
        </StudioWideResultsPanel>
      )}
      settings={settingsPanel}
    />
  )
}

function ModelResultPreview({ tool, config, isGenerating, resultImages }) {
  const ToolIcon = tool.icon

  if (isGenerating || (resultImages && resultImages.length > 0)) {
    return <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} />
  }

  return (
    <StudioResultsViewport>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,107,88,0.22),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(232,220,200,0.12),transparent_45%)]" />
      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded bg-[var(--elevated)] px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-ink dark:bg-white/90 dark:text-black">
            ORNEK
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-champagne dark:bg-white/[0.06] dark:text-[#e8dcc8]">
            <ToolIcon size={18} />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-black/[0.05] bg-[var(--card-bg)] dark:border-white/[0.08]">
            <ToolIcon size={42} strokeWidth={1.35} className="text-champagne dark:text-[#e8dcc8]" />
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.05] bg-[var(--elevated)]/75 p-3 backdrop-blur dark:border-white/[0.08] dark:bg-black/15">
          <p className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">Çıktı</p>
          <h3 className="mt-1 text-sm font-medium tracking-[-0.02em] text-ink dark:text-white">{config.previewTitle}</h3>
          <p className="mt-1 text-[11px] leading-5 text-muted">{config.previewNote}</p>
        </div>
      </div>
    </StudioResultsViewport>
  )
}

function ProModelWorkspace({ tool, config, credits, creditCost, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, promptText, onPromptChange }) {
  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          footer={(
            <div className="rounded-[1.35rem] border border-black/[0.05] bg-[var(--card-bg)] p-4 dark:border-white/[0.06]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-muted" />
                  <span className="text-sm tracking-tight text-ink dark:text-white">Son Oluşturulanlar</span>
                </div>
                <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">
                  Tümünü Gör
                </Link>
              </div>

              {resultImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {resultImages.slice(0, 3).map((url, i) => (
                    <div key={url} className="aspect-[16/9] overflow-hidden rounded-xl">
                      <img src={url} alt={`Sonuç ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/[0.08] px-4 py-8 text-center dark:border-white/[0.08]">
                  <p className="text-xs tracking-tight text-muted">Henüz oluşturma yok</p>
                </div>
              )}
            </div>
          )}
        >
          <ModelResultPreview tool={tool} config={config} isGenerating={isGenerating} resultImages={resultImages} />
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              qualityLabel={config.quality}
              creditCost={creditCost}
              credits={credits}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={config.uploads.map((item) => (
              <UploadCard key={item.label} compact item={item} toolLabel={tool.label} preview={uploadedFiles?.[item.label]} onFileChange={onFileChange} />
            ))}
            controls={(
              <>
                {config.sections.map((section) => (
                  <FastSectionCard key={section.id} section={section} />
                ))}
                <StudioControlCard title="Kamera Çerçevesi" className="flex-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {config.cameraFrames.map((frame, index) => (
                      <button
                        key={frame}
                        type="button"
                        className={`rounded-lg border px-2 py-2 text-xs font-medium tracking-tight transition-colors ${
                          index === 0
                            ? 'border-black/15 bg-black/[0.05] text-ink dark:border-white/20 dark:bg-white/[0.08] dark:text-white'
                            : 'border-black/[0.06] text-muted hover:text-ink dark:border-white/[0.08] dark:hover:text-white'
                        }`}
                      >
                        {frame}
                      </button>
                    ))}
                  </div>
                </StudioControlCard>
                <StudioControlCard title="Kalite Modu" className="md:max-w-[200px]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 transition-colors hover:bg-[var(--card-bg-hover)] dark:border-white/[0.08]"
                  >
                    <span className="text-sm font-medium tracking-tight text-ink dark:text-white">{config.quality}</span>
                    <ChevronDown size={14} className="text-muted" />
                  </button>
                </StudioControlCard>
              </>
            )}
            aside={(
              <StudioControlCard title="Prompt">
                <textarea
                  value={promptText}
                  onChange={(e) => onPromptChange?.(e.target.value)}
                  placeholder="Stil yönlendirmesi yazın..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
                />
              </StudioControlCard>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

// ─── PRO-TRYON (tryon-max) workspace ──────────────────────────────────────────

const TRYON_MAX_DEFAULTS = {
  resolution: '1k',
  generation_mode: 'balanced',
  num_images: 1,
  output_format: 'png',
  seed: '',
  prompt: '',
}


const PACKSHOT_DEFAULTS = {
  resolution: '1k',
}

const SWAP_DEFAULTS = {
  resolution: '1k',
  generation_mode: 'balanced',
  output_format: 'png',
}

const TRYON_DEFAULTS = {
  category: 'auto',
  mode: 'balanced',
  garment_photo_type: 'auto',
  moderation_level: 'permissive',
  num_samples: 1,
  segmentation_free: true,
  output_format: 'png',
  seed: '',
}

function ParamSelect({ label, hint, value, onChange, options }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <label className="text-[10px] uppercase tracking-[0.05em] text-champagne-dim">{label}</label>
        {hint && <CircleHelp size={11} className="text-subtle" />}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-black/[0.06] bg-[var(--card-bg)]/90 px-3 py-2 pr-8 text-[12px] text-ink shadow-sm transition-all focus:border-champagne/35 focus:outline-none focus:ring-2 focus:ring-champagne/15 dark:border-white/[0.08] dark:bg-[#1c1c1e] dark:text-white dark:focus:border-[#e8dcc8]/35 dark:focus:ring-[#e8dcc8]/15 dark:[color-scheme:dark]"
        >
          {options.map(([val, lbl]) => (
            <option key={val} value={val}>{lbl}</option>
          ))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </div>
  )
}

function ParamToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[12px] tracking-tight text-ink dark:text-white">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-black ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}

const RESOLUTION_OPTIONS = [
  { val: '1k', label: '1K', sub: '~1 MP' },
  { val: '2k', label: '2K', sub: '~4 MP' },
  { val: '4k', label: '4K', sub: '~16 MP' },
]

function ProTryonWorkspace({ tool, credits, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, tryonParams, onTryonChange, pricingQualities = [] }) {
  const set = (key) => (val) => onTryonChange({ ...tryonParams, [key]: val })
  const creditCost = calcQualityCost(tryonParams.resolution, pricingQualities, tryonParams.num_images)
  const activeQuality = pricingQualities.find((q) => q.quality === tryonParams.resolution)
  const hasEnough = credits >= creditCost
  const priceFor = (quality) => pricingQualities.find((q) => q.quality === quality)?.creditCost

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          headerExtra={
            resultImages.length > 0 ? (
              <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">
                Galeride Gör
              </Link>
            ) : null
          }
        >
          {isGenerating || resultImages.length > 0 ? (
            <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} />
          ) : (
            <StudioResultsViewport className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%)' }}
              />
              <div className="relative flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] bg-[var(--card-bg)] text-champagne dark:border-white/[0.08]">
                  <Shuffle size={28} strokeWidth={1.4} />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-medium tracking-tight text-ink dark:text-white">Ürün + Model yükle</p>
                  <p className="text-[11px] text-muted">Çözünürlük ve kaliteyi seçtikten sonra Oluştur'a bas</p>
                </div>
                <div className="w-full max-w-xs rounded-2xl border border-black/[0.05] bg-[var(--card-bg)] p-4 dark:border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      ['Çözünürlük', tryonParams.resolution.toUpperCase()],
                      ['Kalite', tryonParams.generation_mode === 'balanced' ? 'Dengeli' : 'Kaliteli'],
                      ['Görsel Sayısı', `${tryonParams.num_images}`],
                      ['Toplam Maliyet', `${creditCost} kredi`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-black/[0.04] bg-[var(--elevated)] px-2.5 py-2 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <p className="text-[9px] uppercase tracking-[0.08em] text-muted">{k}</p>
                        <p className={`mt-0.5 text-[12px] font-semibold ${k === 'Toplam Maliyet' ? 'text-champagne' : 'text-ink dark:text-white'}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StudioResultsViewport>
          )}
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              qualityLabel={`${tryonParams.resolution.toUpperCase()} · ×${tryonParams.num_images} görsel`}
              creditCost={creditCost}
              credits={credits}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
              disabled={!hasEnough}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={[
              { label: 'Ürün Görseli', action: 'Kıyafet / aksesuar yükle', badge: 'ÜRÜN' },
              { label: 'Model Görseli', action: 'Manken fotoğrafı yükle', badge: 'MODEL' },
            ].map((item) => (
              <UploadCard key={item.label} compact item={item} toolLabel={tool.label} preview={uploadedFiles?.[item.label]} onFileChange={onFileChange} />
            ))}
            controls={(
              <>
                <StudioControlCard title="Çözünürlük & Kalite">
                  <StudioSegmentGrid
                    groupId="pro-tryon-resolution"
                    className="mb-3"
                    value={tryonParams.resolution}
                    onChange={set('resolution')}
                    options={RESOLUTION_OPTIONS.map(({ val, label, sub }) => {
                      const unitCost = priceFor(val)
                      return {
                        value: val,
                        label,
                        sub,
                        badge: unitCost != null ? `${unitCost} kr` : '…',
                      }
                    })}
                  />
                  <StudioSegmentGrid
                    groupId="pro-tryon-mode"
                    columns={2}
                    value={tryonParams.generation_mode}
                    onChange={set('generation_mode')}
                    options={[
                      { value: 'balanced', label: 'Dengeli', sub: 'Hız + kalite' },
                      { value: 'quality', label: 'Kaliteli', sub: 'En iyi sonuç' },
                    ]}
                  />
                </StudioControlCard>
                <StudioControlCard title="Çıktı">
                  <div className="grid grid-cols-2 gap-2">
                    <ParamSelect
                      label="Görsel Sayısı"
                      hint
                      value={String(tryonParams.num_images)}
                      onChange={(v) => set('num_images')(Number(v))}
                      options={[['1', '1 görsel'], ['2', '2 görsel'], ['3', '3 görsel'], ['4', '4 görsel']]}
                    />
                    <ParamSelect
                      label="Format"
                      value={tryonParams.output_format}
                      onChange={set('output_format')}
                      options={[['png', 'PNG (Yüksek)'], ['jpeg', 'JPEG (Hızlı)']]}
                    />
                  </div>
                </StudioControlCard>
                <StudioControlCard title="Gelişmiş" className="md:max-w-[220px]">
                  <input
                    type="number"
                    min="0"
                    value={tryonParams.seed}
                    onChange={(e) => set('seed')(e.target.value)}
                    placeholder="Seed (opsiyonel)"
                    className="w-full rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
                  />
                </StudioControlCard>
              </>
            )}
            aside={(
              <StudioControlCard title="Stil Yönlendirmesi">
                <textarea
                  value={tryonParams.prompt}
                  onChange={(e) => set('prompt')(e.target.value)}
                  placeholder='ör. "tuck in shirt", "roll up sleeves"'
                  rows={5}
                  className="w-full resize-none rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
                />
              </StudioControlCard>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

function DecoupeWorkspace({ tool, credits, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, packshotParams, onPackshotChange, pricingQualities = [] }) {
  const set = (key) => (val) => onPackshotChange({ ...packshotParams, [key]: val })
  const creditCost = calcQualityCost(packshotParams.resolution, pricingQualities)
  const hasEnough = credits >= creditCost
  const priceFor = (quality) => pricingQualities.find((q) => q.quality === quality)?.creditCost

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          headerExtra={
            resultImages.length > 0 ? (
              <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">Galeride Gör</Link>
            ) : null
          }
        >
          {isGenerating || resultImages.length > 0 ? (
            <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} />
          ) : (
            <StudioResultsViewport className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%)' }} />
              <div className="relative flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] bg-[var(--card-bg)] text-champagne dark:border-white/[0.08]">
                  <Shuffle size={28} strokeWidth={1.4} />
                </div>
                <p className="text-[13px] font-medium text-ink dark:text-white">Ürün fotoğrafı yükle</p>
                <p className="text-[11px] text-muted">Packshot: temiz arka plan, düz sergi veya askıda sunum</p>
              </div>
            </StudioResultsViewport>
          )}
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              qualityLabel={packshotParams.resolution.toUpperCase()}
              creditCost={creditCost}
              credits={credits}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
              disabled={!hasEnough}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={(
              <UploadCard
                compact
                item={{ label: 'Ürün', action: 'Ürün / on-model fotoğrafı yükle', badge: 'PDP' }}
                toolLabel={tool.label}
                preview={uploadedFiles?.['Ürün']}
                onFileChange={onFileChange}
              />
            )}
            controls={(
              <StudioControlCard title="Çözünürlük" className="flex-[2]">
                <StudioSegmentGrid
                  groupId="pro-decoupe-resolution"
                  value={packshotParams.resolution}
                  onChange={set('resolution')}
                  options={RESOLUTION_OPTIONS.map(({ val, label, sub }) => {
                    const unitCost = priceFor(val)
                    return {
                      value: val,
                      label,
                      sub,
                      badge: unitCost != null ? `${unitCost} kr` : '…',
                    }
                  })}
                />
              </StudioControlCard>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

function SwapWorkspace({ tool, credits, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, swapParams, onSwapChange, pricingQualities = [] }) {
  const set = (key) => (val) => onSwapChange({ ...swapParams, [key]: val })
  const creditCost = calcQualityCost(swapParams.resolution, pricingQualities)
  const hasEnough = credits >= creditCost
  const priceFor = (quality) => pricingQualities.find((q) => q.quality === quality)?.creditCost
  const activeQuality = pricingQualities.find((q) => q.quality === swapParams.resolution)

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          headerExtra={
            resultImages.length > 0 ? (
              <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">Galeride Gör</Link>
            ) : null
          }
        >
          {isGenerating || resultImages.length > 0 ? (
            <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} />
          ) : (
            <StudioResultsViewport className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%)' }} />
              <div className="relative flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] bg-[var(--card-bg)] text-champagne dark:border-white/[0.08]">
                  <Shuffle size={28} strokeWidth={1.4} />
                </div>
                <p className="text-[13px] font-medium text-ink dark:text-white">Ürün + sahne yükle</p>
                <p className="text-[11px] text-muted">Model-swap: kıyafet korunur, model/sahne dönüştürülür</p>
              </div>
            </StudioResultsViewport>
          )}
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              qualityLabel={`${swapParams.resolution.toUpperCase()} · ${swapParams.generation_mode}`}
              creditCost={creditCost}
              credits={credits}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
              disabled={!hasEnough}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={[
              { label: 'Ürün Görseli', action: 'Ürün fotoğrafı yükle', badge: 'ÜRÜN' },
              { label: 'Sahne Görseli', action: 'Sahne / model fotoğrafı yükle', badge: 'SAHNE' },
            ].map((item) => (
              <UploadCard key={item.label} compact item={item} toolLabel={tool.label} preview={uploadedFiles?.[item.label]} onFileChange={onFileChange} />
            ))}
            controls={(
              <>
                <StudioControlCard title="Çözünürlük" className="flex-[1.4]">
                  <StudioSegmentGrid
                    groupId="pro-swap-resolution"
                    value={swapParams.resolution}
                    onChange={set('resolution')}
                    options={RESOLUTION_OPTIONS.map(({ val, label, sub }) => {
                      const unitCost = priceFor(val)
                      return {
                        value: val,
                        label,
                        sub,
                        badge: unitCost != null ? `${unitCost} kr` : '…',
                      }
                    })}
                  />
                </StudioControlCard>
                <StudioControlCard title="İşlem Kalitesi" className="flex-1">
                  <StudioSegmentGrid
                    groupId="pro-swap-mode"
                    value={swapParams.generation_mode}
                    onChange={set('generation_mode')}
                    options={[
                      { value: 'fast', label: 'Hızlı', sub: 'Düşük maliyet' },
                      { value: 'balanced', label: 'Dengeli', sub: 'Hız + kalite' },
                      { value: 'quality', label: 'Kaliteli', sub: 'En iyi sonuç' },
                    ]}
                  />
                </StudioControlCard>
                <StudioControlCard title="Format" className="md:max-w-[200px]">
                  <ParamSelect
                    label="Format"
                    value={swapParams.output_format}
                    onChange={set('output_format')}
                    options={[['png', 'PNG (Yüksek)'], ['jpeg', 'JPEG (Hızlı)']]}
                  />
                </StudioControlCard>
              </>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

function CekimModelWorkspace({ tool, credits, creditCost, onGenerate, isGenerating, jobMessage, uploadedFiles, onFileChange, resultImages, tryonParams, onTryonChange }) {
  const config = {
    uploads: [
      { label: 'Model Görseli', action: 'Model fotoğrafı yükle', badge: 'MODEL' },
      { label: 'Kıyafet Görseli', action: 'Kıyafet fotoğrafı yükle', badge: 'GAR' },
    ],
  }

  const set = (key) => (val) => onTryonChange({ ...tryonParams, [key]: val })

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          headerExtra={
            resultImages.length > 0 ? (
              <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">
                Galeride Gör
              </Link>
            ) : null
          }
        >
          {isGenerating || resultImages.length > 0 ? (
            <ResultImages images={resultImages} isGenerating={isGenerating} tool={tool} />
          ) : (
            <StudioResultsViewport className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%), linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.12) 100%)' }}
              />
              <div className="relative flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.06] bg-[var(--card-bg)] text-champagne dark:border-white/[0.08]">
                  <Shuffle size={28} strokeWidth={1.4} />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-medium tracking-tight text-ink dark:text-white">Model + Kıyafet yükle</p>
                  <p className="text-[11px] text-muted">Kategori ve modu seçtikten sonra Oluştur'a bas</p>
                </div>
                <div className="mt-2 grid w-full max-w-xs grid-cols-2 gap-2 text-left">
                  {[
                    ['Kategori', TRYON_DEFAULTS.category === 'auto' ? 'Otomatik' : tryonParams.category],
                    ['Mod', tryonParams.mode],
                    ['Fotoğraf Tipi', tryonParams.garment_photo_type],
                    ['Örnek Sayısı', String(tryonParams.num_samples)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-black/[0.04] bg-[var(--card-bg)] px-2.5 py-2 dark:border-white/[0.05]">
                      <p className="text-[9px] uppercase tracking-[0.08em] text-muted">{k}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-ink dark:text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StudioResultsViewport>
          )}
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              creditCost={creditCost}
              credits={credits}
              onGenerate={onGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={config.uploads.map((item) => (
              <UploadCard key={item.label} compact item={item} toolLabel={tool.label} preview={uploadedFiles?.[item.label]} onFileChange={onFileChange} />
            ))}
            controls={(
              <>
                <StudioControlCard title="Kıyafet" className="flex-[1.2]">
                  <div className="grid grid-cols-2 gap-2">
                    <ParamSelect
                      label="Kategori"
                      hint
                      value={tryonParams.category}
                      onChange={set('category')}
                      options={[
                        ['auto', 'Otomatik'],
                        ['tops', 'Üst Giyim'],
                        ['bottoms', 'Alt Giyim'],
                        ['one-pieces', 'Kombinezon'],
                      ]}
                    />
                    <ParamSelect
                      label="Fotoğraf Tipi"
                      hint
                      value={tryonParams.garment_photo_type}
                      onChange={set('garment_photo_type')}
                      options={[
                        ['auto', 'Otomatik'],
                        ['model', 'Model Üzerinde'],
                        ['flat-lay', 'Düz Sergi'],
                      ]}
                    />
                  </div>
                </StudioControlCard>
                <StudioControlCard title="Kalite & Çıktı" className="flex-[1.4]">
                  <div className="grid grid-cols-2 gap-2">
                    <ParamSelect
                      label="İşlem Modu"
                      value={tryonParams.mode}
                      onChange={set('mode')}
                      options={[
                        ['performance', 'Hızlı'],
                        ['balanced', 'Dengeli'],
                        ['quality', 'Kaliteli'],
                      ]}
                    />
                    <ParamSelect
                      label="Örnek Sayısı"
                      hint
                      value={String(tryonParams.num_samples)}
                      onChange={(v) => set('num_samples')(Number(v))}
                      options={[['1', '1 görsel'], ['2', '2 görsel'], ['3', '3 görsel'], ['4', '4 görsel']]}
                    />
                    <ParamSelect
                      label="Format"
                      value={tryonParams.output_format}
                      onChange={set('output_format')}
                      options={[['png', 'PNG (Yüksek)'], ['jpeg', 'JPEG (Hızlı)']]}
                    />
                    <ParamSelect
                      label="Moderasyon"
                      value={tryonParams.moderation_level}
                      onChange={set('moderation_level')}
                      options={[
                        ['permissive', 'Standart'],
                        ['conservative', 'Muhafazakar'],
                        ['none', 'Yok'],
                      ]}
                    />
                  </div>
                </StudioControlCard>
                <StudioControlCard title="Gelişmiş" className="md:max-w-[240px]">
                  <div className="space-y-3">
                    <ParamToggle
                      label="Segmentasyonsuz mod"
                      value={tryonParams.segmentation_free}
                      onChange={set('segmentation_free')}
                    />
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.05em] text-muted">Seed (opsiyonel)</label>
                      <input
                        type="number"
                        value={tryonParams.seed}
                        onChange={(e) => set('seed')(e.target.value)}
                        placeholder="Rastgele"
                        className="w-full rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
                      />
                    </div>
                  </div>
                </StudioControlCard>
              </>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

export default function StudioToolWorkspace({ tool }) {
  const { user, credits, setCredits } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [resultImages, setResultImages] = useState([])
  const [promptText, setPromptText] = useState('')
  const [tryonParams, setTryonParams] = useState({ ...TRYON_DEFAULTS })
  const [tryonMaxParams, setTryonMaxParams] = useState({ ...TRYON_MAX_DEFAULTS })
  const [packshotParams, setPackshotParams] = useState({ ...PACKSHOT_DEFAULTS })
  const [swapParams, setSwapParams] = useState({ ...SWAP_DEFAULTS })
  const [toolPricingMap, setToolPricingMap] = useState({})
  const pollRef = useRef(null)

  useEffect(() => {
    setUploadedFiles({})
    setResultImages([])
    setPromptText('')
    setTryonParams({ ...TRYON_DEFAULTS })
    setTryonMaxParams({ ...TRYON_MAX_DEFAULTS })
    setPackshotParams({ ...PACKSHOT_DEFAULTS })
    setSwapParams({ ...SWAP_DEFAULTS })
    if (pollRef.current) clearInterval(pollRef.current)
  }, [tool.id])

  useEffect(() => {
    let cancelled = false
    fetchToolPricingMap().then((map) => {
      if (!cancelled) setToolPricingMap(map)
    })
    return () => { cancelled = true }
  }, [])

  const handleFileChange = useCallback((label, dataUrl) => {
    setUploadedFiles((prev) => {
      if (!dataUrl) {
        const next = { ...prev }
        delete next[label]
        return next
      }
      return { ...prev, [label]: dataUrl }
    })
  }, [])

  const config = useMemo(
    () =>
      TOOL_CONFIGS[tool.id] ?? {
        title: tool.label,
        subtitle: tool.description,
        uploads: [{ label: 'Kaynak', action: 'Dosya yükle', badge: 'ÖRNEK' }],
        sections: creativeSections,
        cameraFrames: ['Full', '3/4', 'Detail', 'Story'],
        quality: 'Standard',
        cost: '50 kredi',
        previewTitle: `${tool.label} önizlemesi`,
        previewNote: tool.description,
        showGuide: true,
        showCameraFrames: true,
        showAdditionalSettings: true,
        showHistory: true,
      },
    [tool]
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobMessage, setJobMessage] = useState('')

  const creditCost = useMemo(() => {
    if (tool.id === 'pro-tryon') {
      return resolveToolCreditCost(tool.id, toolPricingMap, {
        quality: tryonMaxParams.resolution,
        multiplier: tryonMaxParams.num_images,
      })
    }
    if (tool.id === 'pro-decoupe') {
      return resolveToolCreditCost(tool.id, toolPricingMap, { quality: packshotParams.resolution })
    }
    if (tool.id === 'pro-swap') {
      return resolveToolCreditCost(tool.id, toolPricingMap, { quality: swapParams.resolution })
    }
    if (tool.id === 'cekim-model') {
      return resolveToolCreditCost(tool.id, toolPricingMap, {
        quality: '2k',
        multiplier: tryonParams.num_samples,
      })
    }
    return resolveToolCreditCost(tool.id, toolPricingMap, { quality: '2k' })
  }, [tool.id, toolPricingMap, tryonMaxParams, packshotParams, swapParams, tryonParams.num_samples])

  const handleGenerate = async () => {
    if (!user?.id) {
      setJobMessage('Kullanıcı bulunamadı. Çıkış yapıp tekrar giriş yap.')
      return
    }

    const activeParams = tool.id === 'pro-tryon'
      ? tryonMaxParams
      : tool.id === 'pro-decoupe'
        ? packshotParams
        : tool.id === 'pro-swap'
          ? swapParams
          : tryonParams
    const creditCostForJob = creditCost
    const inputs = buildFashnInputs(tool.id, uploadedFiles, promptText, activeParams)

    setIsGenerating(true)
    setJobMessage('')
    setResultImages([])
    if (pollRef.current) clearInterval(pollRef.current)

    try {
      const response = await fetch(apiUrl('/api/jobs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          toolKey: tool.id,
          prompt: promptText || `${tool.label} - generate`,
          creditCost: creditCostForJob,
          inputs,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setJobMessage(payload.message || 'İş oluşturulamadı.')
        setIsGenerating(false)
        return
      }

      if (typeof payload.remainingCredits === 'number') {
        setCredits(payload.remainingCredits)
      }

      const jobId = payload.id
      if (!jobId) {
        setJobMessage('İş kuyruğa alındı.')
        setIsGenerating(false)
        return
      }

      setJobMessage('Üretiliyor...')

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(apiUrl(`/api/jobs/${jobId}/status`))
          if (!statusRes.ok) return
          const statusData = await statusRes.json()

          if (statusData.status === 'Completed') {
            clearInterval(pollRef.current)
            setIsGenerating(false)
            const urls = statusData.resultUrls
              ? (Array.isArray(statusData.resultUrls) ? statusData.resultUrls : JSON.parse(statusData.resultUrls))
              : []
            setResultImages(urls)
            setJobMessage(urls.length > 0 ? '' : 'Tamamlandı fakat görsel bulunamadı.')
            if (typeof statusData.remainingCredits === 'number') setCredits(statusData.remainingCredits)
          } else if (statusData.status === 'Failed') {
            clearInterval(pollRef.current)
            setIsGenerating(false)
            setJobMessage(statusData.errorMessage || 'Üretim başarısız oldu.')
          }
        } catch {
          // network hiccup — keep polling
        }
      }, 3000)
    } catch {
      setJobMessage('Backend bağlantısı kurulamadı.')
      setIsGenerating(false)
    }
  }

  const sharedProps = {
    tool,
    config,
    credits,
    creditCost,
    onGenerate: handleGenerate,
    isGenerating,
    jobMessage,
    uploadedFiles,
    onFileChange: handleFileChange,
    resultImages,
    promptText,
    onPromptChange: setPromptText,
    tryonParams,
    onTryonChange: setTryonParams,
    tryonMaxParams,
    onTryonMaxChange: setTryonMaxParams,
  }

  if (tool.id === 'cekim-model') {
    return <CekimModelWorkspace {...sharedProps} />
  }

  if (tool.id === 'pro-tryon') {
    return <ProTryonWorkspace {...sharedProps} tryonParams={tryonMaxParams} onTryonChange={setTryonMaxParams} pricingQualities={getToolQualities(toolPricingMap, 'pro-tryon')} />
  }

  if (tool.id === 'pro-decoupe') {
    return (
      <DecoupeWorkspace
        {...sharedProps}
        packshotParams={packshotParams}
        onPackshotChange={setPackshotParams}
        pricingQualities={getToolQualities(toolPricingMap, 'pro-decoupe')}
      />
    )
  }

  if (tool.id === 'pro-swap') {
    return (
      <SwapWorkspace
        {...sharedProps}
        swapParams={swapParams}
        onSwapChange={setSwapParams}
        pricingQualities={getToolQualities(toolPricingMap, 'pro-swap')}
      />
    )
  }

  if (tool.id === 'pro-model') {
    return <ProModelWorkspace {...sharedProps} />
  }

  if (tool.id === 'cekim-editorial' || tool.id === 'cekim-pose' || tool.id === 'cekim-video') {
    return <FastExpressWorkspace {...sharedProps} />
  }

  return (
    <StudioToolShell
      results={(
        <StudioWideResultsPanel
          footer={
            config.showHistory !== false ? (
              <div className="rounded-[1.35rem] border border-black/[0.05] bg-[var(--card-bg)] p-4 dark:border-white/[0.06]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-muted" />
                    <span className="text-sm tracking-tight text-ink dark:text-white">Son Oluşturulanlar</span>
                  </div>
                  <Link to="/gallery" className="text-xs tracking-tight text-muted transition-colors hover:text-ink dark:hover:text-white">
                    Tümünü Gör
                  </Link>
                </div>

                {resultImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {resultImages.slice(0, 3).map((url, i) => (
                      <div key={url} className="aspect-[16/9] overflow-hidden rounded-xl">
                        <img src={url} alt={`Sonuç ${i + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-black/[0.08] px-4 py-8 text-center dark:border-white/[0.08]">
                    <p className="text-xs tracking-tight text-muted">Henüz oluşturma yok</p>
                  </div>
                )}
              </div>
            ) : null
          }
        >
          <ResultPreview tool={tool} config={config} isGenerating={isGenerating} resultImages={resultImages} />
        </StudioWideResultsPanel>
      )}
      settings={(
        <StudioSettingsPanel
          footer={(
            <StudioGenerateBar
              qualityLabel={config.quality}
              creditCost={creditCost}
              credits={credits}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              jobMessage={jobMessage}
            />
          )}
        >
          <StudioSettingsColumns
            uploads={config.uploads.map((item) => (
              <UploadCard key={item.label} compact item={item} toolLabel={tool.label} preview={uploadedFiles[item.label]} onFileChange={handleFileChange} />
            ))}
            controls={(
              <>
                {config.sections.map((section) => (
                  <FastSectionCard key={section.id} section={section} />
                ))}
                {config.showCameraFrames !== false && (
                  <StudioControlCard title="Kamera Çerçevesi" className="flex-1">
                    <div className="grid grid-cols-4 gap-1.5">
                      {config.cameraFrames.map((frame, index) => (
                        <button
                          key={frame}
                          type="button"
                          className={`rounded-xl border px-2 py-2 text-xs font-medium tracking-tight transition-colors ${
                            index === 0
                              ? 'border-black/15 bg-black/[0.05] text-ink dark:border-white/20 dark:bg-white/[0.08] dark:text-white'
                              : 'border-black/[0.06] text-muted hover:text-ink dark:border-white/[0.08] dark:hover:text-white'
                          }`}
                        >
                          {frame}
                        </button>
                      ))}
                    </div>
                  </StudioControlCard>
                )}
                <StudioControlCard title="Kalite Modu" className="md:max-w-[200px]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 transition-colors hover:bg-[var(--card-bg-hover)] dark:border-white/[0.08]"
                  >
                    <span className="text-sm font-medium tracking-tight text-ink dark:text-white">{config.quality}</span>
                    <ChevronDown size={14} className="text-muted" />
                  </button>
                </StudioControlCard>
              </>
            )}
            aside={(
              <>
                <StudioControlCard title="Prompt">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Stil yönlendirmesi yazın..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 text-[12px] text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-black/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:ring-white/10"
                  />
                </StudioControlCard>
                {config.showGuide !== false && (
                  <StudioControlCard title="Hızlı Akış">
                    <div className="flex flex-col gap-2">
                      {[
                        'Önce kaynak görselleri ekleyin.',
                        'Stil ve çıktı ayarlarını belirleyin.',
                        'Kredi hazır olduğunda oluştur butonuyla üretimi başlatın.',
                      ].map((step, index) => (
                        <span
                          key={step}
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.05] bg-[var(--card-bg)] px-2.5 py-1 text-[10px] text-muted dark:border-white/[0.06]"
                        >
                          <span className="font-medium text-champagne">{index + 1}</span>
                          {step}
                        </span>
                      ))}
                    </div>
                  </StudioControlCard>
                )}
              </>
            )}
          />
        </StudioSettingsPanel>
      )}
    />
  )
}

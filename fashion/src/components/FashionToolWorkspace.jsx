import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  History,
  ImagePlus,
  Lock,
  Play,
  Settings2,
  Shuffle,
  Upload,
} from 'lucide-react'

const selectField = (label, value) => ({ type: 'select', label, value })
const sliderField = (label, value, min, max, current = value) => ({ type: 'slider', label, value, min, max, current })
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5207'

function parseCreditCost(costLabel) {
  const parsed = Number.parseInt(String(costLabel ?? '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(parsed) ? parsed : 0
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
      { label: 'Referans Zemin', action: 'Zemin referansı ekle', badge: 'REF' },
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

function UploadCard({ item, toolLabel }) {
  return (
    <div className="rounded-2xl border border-black/[0.05] p-3 dark:border-white/[0.06]">
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.05em] text-muted">{item.label}</label>
        {!item.locked && <CircleHelp size={13} className="text-subtle" />}
        {item.locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-500">
            <Lock size={10} />
            {item.lockedBadge ?? 'PRO'}
          </span>
        )}
      </div>

      {item.locked ? (
        <div className="flex h-24 flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.08] bg-[var(--card-bg)] px-4 text-center dark:border-white/[0.08]">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.04] text-muted dark:bg-white/[0.05]">
            <Lock size={14} />
          </div>
          <p className="text-[11px] text-muted">{item.lockedText}</p>
        </div>
      ) : (
        <div className="group relative overflow-hidden rounded-2xl border border-black/[0.05] bg-[linear-gradient(180deg,rgba(122,107,88,0.09),rgba(0,0,0,0))] dark:border-white/[0.08]">
          <div className="flex h-28 flex-col items-center justify-center gap-2 bg-[var(--card-bg)]/30 px-4 text-center">
            <div className="absolute left-2 top-2 rounded-full bg-[var(--elevated)] px-2 py-0.5 text-[9px] font-medium tracking-[0.08em] text-ink dark:bg-white/90 dark:text-black">
              {item.badge ?? 'ÖRNEK'}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04] text-champagne shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-white/[0.06]">
              <ImagePlus size={18} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-ink dark:text-white">{toolLabel}</p>
              <p className="mt-1 text-[10px] text-muted">{item.action}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/10 group-hover:opacity-100 dark:group-hover:bg-black/20">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--elevated)] px-2.5 py-1 text-[10px] font-medium text-ink shadow-sm dark:bg-[#171717] dark:text-white">
                <Upload size={12} />
                Yükle
              </span>
            </div>
          </div>
        </div>
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

function ResultPreview({ tool, config }) {
  const ToolIcon = tool.icon

  return (
    <div className="relative overflow-hidden rounded-[1.4rem] border border-black/[0.06] dark:border-white/[0.08]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(122,107,88,0.24), transparent 40%), linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.12) 100%)',
        }}
      />
      <div className="relative aspect-[4/5] sm:aspect-[5/4]">
        <div className="flex h-full flex-col justify-between p-4 sm:p-5">
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
            <p className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">Fashion AI Output</p>
            <h3 className="mt-1 text-sm font-medium tracking-[-0.02em] text-ink dark:text-white">{config.previewTitle}</h3>
            <p className="mt-1 text-[11px] leading-5 text-muted">{config.previewNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FastSectionCard({ section }) {
  return (
    <div className="rounded-[1.35rem] border border-black/[0.05] bg-[var(--elevated)]/65 p-4 backdrop-blur dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.08em] text-muted">{section.title}</span>
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

      <div className={`grid gap-2 ${getColumnClass(section.columns)}`}>
        {section.fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-black/[0.05] bg-[var(--card-bg)] px-3 py-2 dark:border-white/[0.06]"
          >
            <p className="text-[10px] tracking-[-0.01em] text-muted">{field.label}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium tracking-[-0.01em] text-ink dark:text-white">{field.value}</span>
              <ChevronDown size={13} className="text-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FastExpressWorkspace({ tool, config, credits, onGenerate, isGenerating, jobMessage }) {
  const ToolIcon = tool.icon
  const isEditorial = tool.id === 'cekim-editorial'

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-medium tracking-[-0.02em] text-ink dark:text-white">{config.title}</h1>
          <p className="mt-1 text-[12px] tracking-[-0.01em] text-muted">{config.subtitle}</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.06] bg-[var(--card-bg)] px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-champagne dark:border-white/[0.08]">
          <ToolIcon size={12} />
          {isEditorial ? 'Fast Editorial Flow' : 'Fast Pose Flow'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.uploads.map((item) => (
              <UploadCard key={item.label} item={item} toolLabel={tool.label} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {config.sections.map((section) => (
              <FastSectionCard key={section.id} section={section} />
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-black/[0.05] bg-[linear-gradient(180deg,rgba(122,107,88,0.08),rgba(0,0,0,0))] p-4 dark:border-white/[0.06]">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/[0.05] bg-[var(--elevated)]/70 px-3 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-muted">Kalite Modu</p>
                  <p className="mt-1 text-sm font-medium tracking-tight text-ink dark:text-white">{config.quality}</p>
                </div>
                <div className="rounded-2xl border border-black/[0.05] bg-[var(--elevated)]/70 px-3 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-muted">Kredi Maliyeti</p>
                  <p className="mt-1 text-sm font-medium tracking-tight text-ink dark:text-white">{config.cost}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-black/90 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-white/[0.08] dark:bg-white dark:text-black"
              >
                {isGenerating ? 'Oluşturuluyor...' : 'Oluştur'}
                <ArrowRight size={14} />
              </button>
              {jobMessage ? <p className="text-[11px] text-muted sm:justify-self-end">{jobMessage}</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-[1.5rem] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[13px] font-medium tracking-[-0.01em] text-muted">Sonuçlar</h3>
            </div>
            <ResultPreview tool={tool} config={config} />
          </div>

          <div className="rounded-[1.5rem] border border-black/[0.05] bg-[var(--card-bg)] p-4 dark:border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">Hızlı Akış</p>
            <p className="mt-1 text-[11px] text-muted">Mevcut kredi: {credits}</p>
            <h3 className="mt-1 text-sm font-medium tracking-[-0.02em] text-ink dark:text-white">
              {isEditorial ? 'Tek ürün, tek sahne, hızlı kampanya karesi.' : 'Tek ürün, hızlı duruş yönlendirmesi ve temiz kadraj.'}
            </h3>
            <div className="mt-3 space-y-2">
              {(isEditorial
                ? ['Ürünü yükle', 'Sahne ve stil seç', 'Tek kare sonucu al']
                : ['Referans modeli ekle', 'Poz ve kadraj seç', 'Lookbook karesini üret']
              ).map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-black/[0.05] bg-[var(--elevated)]/70 px-3 py-2 text-[11px] text-muted dark:border-white/[0.06] dark:bg-white/[0.02]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModelResultPreview({ tool, config }) {
  const ToolIcon = tool.icon

  return (
    <div className="relative overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,107,88,0.22),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(232,220,200,0.12),transparent_45%)]" />
      <div className="relative aspect-[3/4] sm:aspect-square">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded bg-[var(--elevated)] px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-ink dark:bg-white/90 dark:text-black">
              ORNEK
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-champagne dark:bg-white/[0.06] dark:text-[#e8dcc8]">
              <ToolIcon size={18} />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex h-36 w-full max-w-[240px] items-center justify-center rounded-2xl border border-black/[0.05] bg-[var(--card-bg)] dark:border-white/[0.08]">
              <ToolIcon size={52} strokeWidth={1.35} className="text-champagne dark:text-[#e8dcc8]" />
            </div>
          </div>

          <div className="rounded-2xl border border-black/[0.05] bg-[var(--elevated)]/75 p-3 backdrop-blur dark:border-white/[0.08] dark:bg-black/15">
            <p className="text-[10px] uppercase tracking-[0.08em] text-champagne-dim">Fashion AI Output</p>
            <h3 className="mt-1 text-sm font-medium tracking-[-0.02em] text-ink dark:text-white">{config.previewTitle}</h3>
            <p className="mt-1 text-[11px] leading-5 text-muted">{config.previewNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProModelWorkspace({ tool, config, credits, onGenerate, isGenerating, jobMessage }) {
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [openSections, setOpenSections] = useState({})

  useEffect(() => {
    setSettingsOpen(true)
    setGuideOpen(false)
    setOpenSections(Object.fromEntries((config.sections ?? []).map((section) => [section.id, true])))
    setJobMessage('')
  }, [config, tool.id])

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[18px] font-medium tracking-[-0.02em] text-ink dark:text-white">{config.title}</h1>
        <p className="mt-1 text-[12px] tracking-[-0.01em] text-muted">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[340px_1fr]">
        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.5))] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <button
            type="button"
            onClick={() => setSettingsOpen((current) => !current)}
            className="flex w-full items-center justify-between border-b border-black/[0.05] px-4 py-3 lg:hidden dark:border-white/[0.04]"
          >
            <span className="text-[13px] font-medium tracking-[-0.01em] text-ink dark:text-white">Ayarlar</span>
            <ChevronLeft size={16} className={`text-muted transition-transform ${settingsOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          <div className={`${settingsOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-4 p-4">
                <div className="overflow-hidden rounded-xl border border-red-500/20 bg-[linear-gradient(90deg,rgba(220,38,38,0.16),rgba(220,38,38,0.06))]">
                  <button
                    type="button"
                    onClick={() => setGuideOpen((current) => !current)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-[0_10px_28px_rgba(220,38,38,0.3)]">
                        <Play size={14} className="ml-0.5 fill-current" />
                      </div>
                      <p className="text-[14px] font-medium tracking-tight text-ink dark:text-white">Nasıl Kullanılır?</p>
                    </div>
                    <ChevronDown size={16} className={`text-muted transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {guideOpen && (
                    <div className="space-y-2 border-t border-red-500/15 px-3 pb-3 pt-2">
                      {[
                        'Ürün görselini yükleyin.',
                        'Kimlik ve görünüm ayarlarını seçin.',
                        'Kredi hazır olduğunda model üretimini başlatın.',
                      ].map((step) => (
                        <div key={step} className="rounded-xl bg-black/[0.03] px-3 py-2 text-[11px] text-muted dark:bg-white/[0.03]">
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {config.uploads.map((item) => (
                  <UploadCard key={item.label} item={item} toolLabel={tool.label} />
                ))}

                <div className="space-y-3">
                  {config.sections.map((section) => (
                    <SectionBlock
                      key={section.id}
                      section={section}
                      open={Boolean(openSections[section.id])}
                      onToggle={() => toggleSection(section.id)}
                    />
                  ))}
                </div>

                <div className="space-y-3 border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                  <div>
                    <label className="mb-2 block text-xs tracking-tight text-ink dark:text-white">Kamera Çerçevesi</label>
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
                  </div>

                  <div className="border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                    <label className="mb-1.5 block text-[9px] uppercase tracking-[0.1em] text-muted">Kalite Modu</label>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 transition-colors hover:bg-[var(--card-bg-hover)] dark:border-white/[0.08]"
                    >
                      <span className="text-sm font-medium tracking-tight text-ink dark:text-white">{config.quality}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                  </div>

                  <div className="border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-tight text-ink dark:text-white">Kredi Maliyeti</span>
                      <span className="text-xs font-medium tracking-tight text-ink dark:text-white">{config.cost}</span>
                    </div>
                    <p className="mt-1 text-[10px] tracking-tight text-muted">Mevcut: {credits}</p>
                  </div>

                  <div className="rounded-xl border border-black/[0.05] px-3 dark:border-white/[0.06]">
                    <button type="button" className="flex w-full items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <Settings2 size={14} className="text-muted" />
                        <span className="text-[10px] uppercase tracking-[0.05em] text-muted">Ek Ayarlar</span>
                      </div>
                      <ChevronDown size={16} className="text-muted" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/[0.06] p-4 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-black/[0.08] bg-black/90 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-black dark:text-white"
                >
                  {isGenerating ? 'Oluşturuluyor...' : 'Oluştur'}
                  <ArrowRight size={14} />
                </button>
                {jobMessage ? <p className="mt-2 text-[11px] text-muted">{jobMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.46))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-medium tracking-[-0.01em] text-muted">Sonuçlar</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <ModelResultPreview tool={tool} config={config} />
            </div>
          </div>

          <div className="mt-4">
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

              <div className="rounded-2xl border border-dashed border-black/[0.08] px-4 py-8 text-center dark:border-white/[0.08]">
                <p className="text-xs tracking-tight text-muted">Henüz oluşturma yok</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FashionToolWorkspace({ tool }) {
  const { user, credits, setCredits } = useAuth()
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
  const [settingsOpen, setSettingsOpen] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [openSections, setOpenSections] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobMessage, setJobMessage] = useState('')

  useEffect(() => {
    setSettingsOpen(true)
    setGuideOpen(false)
    setOpenSections(Object.fromEntries((config.sections ?? []).map((section) => [section.id, true])))
  }, [config, tool.id])

  const toggleSection = (sectionId) => {
    setOpenSections((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  const handleGenerate = async () => {
    if (!user?.id) {
      setJobMessage('Kullanıcı bulunamadı. Çıkış yapıp tekrar giriş yap.')
      return
    }

    const creditCost = parseCreditCost(config.cost)
    setIsGenerating(true)
    setJobMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          toolKey: tool.id,
          prompt: `${tool.label} - UI generate request`,
          creditCost,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setJobMessage(payload.message || 'İş oluşturulamadı.')
        return
      }

      if (typeof payload.remainingCredits === 'number') {
        setCredits(payload.remainingCredits)
      }
      setJobMessage('İş kuyruğa alındı.')
    } catch {
      setJobMessage('Backend bağlantısı kurulamadı.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (tool.id === 'pro-model') {
    return (
      <ProModelWorkspace
        tool={tool}
        config={config}
        credits={credits}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        jobMessage={jobMessage}
      />
    )
  }

  if (tool.id === 'cekim-editorial' || tool.id === 'cekim-pose') {
    return (
      <FastExpressWorkspace
        tool={tool}
        config={config}
        credits={credits}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        jobMessage={jobMessage}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[18px] font-medium tracking-[-0.02em] text-ink dark:text-white">{config.title}</h1>
        <p className="mt-1 text-[12px] tracking-[-0.01em] text-muted">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[340px_1fr]">
        <div className="glass-card overflow-hidden rounded-[1.5rem]">
          <button
            type="button"
            onClick={() => setSettingsOpen((current) => !current)}
            className="flex w-full items-center justify-between px-4 py-3 lg:hidden"
          >
            <span className="text-[13px] font-medium tracking-[-0.01em] text-ink dark:text-white">Ayarlar</span>
            <ChevronLeft size={16} className={`text-muted transition-transform ${settingsOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          <div className={`${settingsOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="flex h-full flex-col">
              <div className="space-y-4 p-4">
                {config.showGuide !== false && (
                  <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-[linear-gradient(90deg,rgba(239,68,68,0.16),rgba(239,68,68,0.05))]">
                    <button
                      type="button"
                      onClick={() => setGuideOpen((current) => !current)}
                      className="flex w-full items-center justify-between px-3 py-3 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_12px_30px_rgba(239,68,68,0.28)]">
                          <Play size={14} className="ml-0.5 fill-current" />
                        </div>
                        <p className="text-[14px] font-medium tracking-tight text-ink dark:text-white">Nasıl Kullanılır?</p>
                      </div>
                      <ChevronDown size={16} className={`text-muted transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {guideOpen && (
                      <div className="space-y-2 border-t border-red-500/15 px-3 pb-3 pt-2">
                        {[
                          'Önce kaynak görselleri ekleyin.',
                          'Sol panelden stil ve çıktı ayarlarını belirleyin.',
                          'Kredi hazır olduğunda oluştur butonuyla üretimi başlatın.',
                        ].map((step) => (
                          <div key={step} className="rounded-xl bg-black/[0.03] px-3 py-2 text-[11px] text-muted dark:bg-white/[0.03]">
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {config.uploads.map((item) => (
                  <UploadCard key={item.label} item={item} toolLabel={tool.label} />
                ))}

                <div className="space-y-3">
                  {config.sections.map((section) => (
                    <SectionBlock
                      key={section.id}
                      section={section}
                      open={Boolean(openSections[section.id])}
                      onToggle={() => toggleSection(section.id)}
                    />
                  ))}
                </div>

                <div className="space-y-3 border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                  {config.showCameraFrames !== false && (
                    <div>
                      <label className="mb-2 block text-xs tracking-tight text-ink dark:text-white">Kamera Çerçevesi</label>
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
                    </div>
                  )}

                  <div className="border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                    <label className="mb-1.5 block text-[9px] uppercase tracking-[0.1em] text-muted">Kalite Modu</label>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl border border-black/[0.06] bg-[var(--card-bg)] px-3 py-2.5 transition-colors hover:bg-[var(--card-bg-hover)] dark:border-white/[0.08]"
                    >
                      <span className="text-sm font-medium tracking-tight text-ink dark:text-white">{config.quality}</span>
                      <ChevronDown size={14} className="text-muted" />
                    </button>
                  </div>

                  <div className="border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-tight text-ink dark:text-white">Kredi Maliyeti</span>
                      <span className="text-xs font-medium tracking-tight text-ink dark:text-white">{config.cost}</span>
                    </div>
                    <p className="mt-1 text-[10px] tracking-tight text-muted">Mevcut: {credits}</p>
                  </div>

                  {config.showAdditionalSettings !== false && (
                    <div className="rounded-2xl border border-black/[0.05] px-3 dark:border-white/[0.06]">
                      <button type="button" className="flex w-full items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <Settings2 size={14} className="text-muted" />
                          <span className="text-[10px] uppercase tracking-[0.05em] text-muted">Ek Ayarlar</span>
                        </div>
                        <ChevronDown size={16} className="text-muted" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-black/[0.06] p-4 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-black/90 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white dark:text-black"
                >
                  {isGenerating ? 'Oluşturuluyor...' : 'Oluştur'}
                  <ArrowRight size={14} />
                </button>
                {jobMessage ? <p className="mt-2 text-[11px] text-muted">{jobMessage}</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card min-h-[800px] rounded-[1.5rem] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-medium tracking-[-0.01em] text-muted">Sonuçlar</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <ResultPreview tool={tool} config={config} />
            </div>
          </div>

          {config.showHistory !== false && (
            <div className="mt-4">
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

                <div className="rounded-2xl border border-dashed border-black/[0.08] px-4 py-8 text-center dark:border-white/[0.08]">
                  <p className="text-xs tracking-tight text-muted">Henüz oluşturma yok</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

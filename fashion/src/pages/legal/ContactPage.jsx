import { Mail, ArrowUpRight } from 'lucide-react'
import LegalPageLayout, { LegalBlock } from '@/components/compliance/LegalPageLayout'

export default function ContactPage() {
  return (
    <LegalPageLayout
      label="Destek"
      title="İletişim"
      description="Hesap, faturalama, iade veya teknik konularda destek ekibimize nasıl ulaşabileceğiniz."
      icon={Mail}
    >
      <LegalBlock title="Destek kanalı">
        <p>
          Hesap, faturalama, iade veya teknik konularda ekibimize e-posta ile ulaşabilirsiniz. Genellikle bir ila iki
          iş günü içinde yanıt veririz.
        </p>
      </LegalBlock>

      <LegalBlock highlight>
        <a
          href="mailto:support@nulatechnology.com"
          className="group flex items-center justify-between gap-4 rounded-xl border border-cyan-500/20 bg-white/40 px-4 py-4 transition-colors hover:border-cyan-500/35 dark:bg-black/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Mail size={18} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-subtle mb-0.5">E-posta</p>
              <p className="text-sm font-medium text-ink truncate">support@nulatechnology.com</p>
            </div>
          </div>
          <ArrowUpRight
            size={18}
            className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
            strokeWidth={1.5}
          />
        </a>
      </LegalBlock>

      <LegalBlock title="Mesajınızda belirtin">
        <p>
          Hesap e-postanızı mutlaka ekleyin. Ödeme sorularında mümkünse işlem referansını da paylaşın; böylece talebinizi
          daha hızlı çözebiliriz.
        </p>
      </LegalBlock>
    </LegalPageLayout>
  )
}

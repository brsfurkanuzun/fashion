import { Receipt } from 'lucide-react'
import LegalPageLayout, { LegalBlock } from '@/components/compliance/LegalPageLayout'

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      label="Yasal"
      title="İade Politikası"
      description="Dijital kredi satın alımlarında iade koşulları ve kullanılmış kredilere ilişkin kurallar."
      icon={Receipt}
    >
      <LegalBlock title="Kredi tüketimi">
        <p>
          Krediler, Nula Design üzerinde yapay zekâ görsel üretim hizmetlerine erişmek için kullanılan dijital hizmet
          birimleridir. Bir üretim için kredi kullanıldığında anında tüketilir ve geri yüklenemez.
        </p>
      </LegalBlock>

      <LegalBlock title="Kullanılmış krediler" highlight>
        <p>
          Dijital yapay zekâ hizmetlerinin anında teslim edilmesi ve tüketilmesi nedeniyle kullanılmış krediler iade
          edilemez.
        </p>
      </LegalBlock>

      <LegalBlock title="Kullanılmamış krediler">
        <p>
          Kullanılmamış krediler için yapılan iade talepleri, Kullanım Şartlarımız ve yürürlükteki mevzuata göre
          duruma özel değerlendirilir. Talep için hesap e-postanız ve işlem bilgilerinizle destek ekibimize ulaşın.
        </p>
      </LegalBlock>

      <LegalBlock title="Önemli not">
        <p>
          Kredilerin parasal değeri yoktur; kullanıcılar arasında devredilemez ve nakde çevrilemez.
        </p>
      </LegalBlock>
    </LegalPageLayout>
  )
}

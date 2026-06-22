import { FileText } from 'lucide-react'
import LegalPageLayout, { LegalBlock } from '@/components/compliance/LegalPageLayout'

export default function TermsPage() {
  return (
    <LegalPageLayout
      label="Yasal"
      title="Kullanım Şartları"
      description="Platformu kullanırken geçerli olan kurallar ve dijital kredi kullanımına ilişkin temel hükümler."
      icon={FileText}
    >
      <LegalBlock title="Hizmet kapsamı">
        <p>
          Nula Design&apos;ı kullanarak bu Kullanım Şartları&apos;nı kabul etmiş olursunuz. Platform; dijital krediler
          aracılığıyla erişilen yapay zekâ destekli moda görsel üretimi ve sanal deneme (try-on) hizmetleri sunar.
        </p>
      </LegalBlock>

      <LegalBlock title="Kredi kullanımı">
        <p>
          Krediler nakit değeri olmayan dijital hizmet birimleridir. Kullanıcılar arasında devredilemez ve paraya
          çevrilemez. Krediler yalnızca bu platformdaki hizmetlere erişmek için kullanılabilir.
        </p>
      </LegalBlock>

      <LegalBlock title="Hesap güvenliği ve kullanım">
        <p>
          Hesabınızın güvenliğinden siz sorumlusunuz. Hizmeti kötüye kullanamaz, yetkisiz erişim denemesi yapamaz veya
          üretilen içerikleri yürürlükteki mevzuata ya da üçüncü taraf haklarına aykırı şekilde kullanamazsınız.
        </p>
      </LegalBlock>

      <LegalBlock title="Güncellemeler">
        <p>
          Bu şartları zaman zaman güncelleyebiliriz. Değişikliklerden sonra platformu kullanmaya devam etmeniz,
          güncellenmiş şartları kabul ettiğiniz anlamına gelir.
        </p>
      </LegalBlock>
    </LegalPageLayout>
  )
}

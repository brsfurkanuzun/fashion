import { Shield } from 'lucide-react'
import LegalPageLayout, { LegalBlock } from '@/components/compliance/LegalPageLayout'

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      label="Yasal"
      title="Gizlilik Politikası"
      description="Hesabınız, ödemeleriniz ve üretim süreçlerinizde hangi verilerin toplandığı ve nasıl kullanıldığı."
      icon={Shield}
    >
      <LegalBlock title="Toplanan veriler">
        <p>
          Nula Design; hesabınızı işletmek, ödemeleri işlemek ve yapay zekâ üretim hizmetlerini sunmak için gerekli
          bilgileri toplar. Bunlar adınız, e-posta adresiniz, fatura bilgileriniz ve işlem için yüklediğiniz içerikleri
          kapsayabilir.
        </p>
      </LegalBlock>

      <LegalBlock title="Verilerin kullanımı">
        <p>
          Bu bilgileri hizmeti sunmak ve geliştirmek, kullanıcıları doğrulamak, işlemleri gerçekleştirmek ve hesabınızla
          ilgili iletişim kurmak için kullanırız. Ödeme kartı verileri ödeme sağlayıcılarımız tarafından işlenir;
          sunucularımızda saklanmaz.
        </p>
      </LegalBlock>

      <LegalBlock title="Paylaşım">
        <p>
          Kişisel verilerinizi satmayız. Platformun işletilmesine yardımcı olan hizmet sağlayıcılarla, uygun güvenlik
          önlemleriyle sınırlı olarak paylaşabiliriz.
        </p>
      </LegalBlock>

      <LegalBlock title="Haklarınız">
        <p>
          Hesap verilerinize erişim veya silme talebinde bulunmak için bizimle iletişime geçebilirsiniz. Bu politika
          hakkındaki sorularınız için iletişim sayfamızı kullanın.
        </p>
      </LegalBlock>
    </LegalPageLayout>
  )
}

import Hero from '../components/Hero'
import DetailPreservation from '../components/DetailPreservation'
import StepsSection from '../components/StepsSection'
import ToolsSection from '../components/ToolsSection'
import MotionSection from '../components/MotionSection'
import MekanRender from '../components/MekanRender'
import CTA from '../components/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <DetailPreservation />
      <StepsSection />
      <ToolsSection />
      <MotionSection />
      <MekanRender />
      <CTA />
    </>
  )
}

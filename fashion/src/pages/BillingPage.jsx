import { ArrowRight, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BillingPage() {
  const navigate = useNavigate()
  const { credits, user } = useAuth()

  const currentPlan = user?.role === 'admin' ? 'pro' : 'free'

  return (
    <div className="min-h-screen pt-20">
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="h-full">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div className="flex flex-col gap-2 p-4 md:p-8">
                <h1 className="text-2xl font-bold text-ink">App Billing</h1>
                <p className="text-muted">Manage your FASHN App subscription and credits</p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-10">
              <div className="grid w-full grid-cols-1 gap-6 px-4 md:px-8 xl:grid-cols-2">
                <div className="rounded-3xl border border-black/[0.08] bg-white/80 p-6 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2),0_4px_16px_-4px_rgba(0,0,0,0.25)]">
                  <h3 className="mb-5 text-xl font-semibold text-ink dark:text-zinc-100">Plan Details</h3>
                  <div className="mb-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted md:text-base">Current Plan</span>
                      <span className="text-sm font-medium uppercase tracking-[0.2em] text-ink dark:text-zinc-100 md:text-base">
                        {currentPlan}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-black/[0.08] pt-4 dark:border-white/[0.08] lg:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate('/fiyatlandirma')}
                      className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-xl border border-foreground/20 bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-in-out hover:border-foreground/35 hover:bg-foreground/[0.04] dark:border-white/[0.12] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/[0.08] bg-white/80 p-6 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2),0_4px_16px_-4px_rgba(0,0,0,0.25)]">
                  <h3 className="mb-5 text-xl font-semibold text-ink dark:text-zinc-100">Credits Usage</h3>
                  <div className="mb-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted md:text-base">Available Credits</span>
                      </div>
                      <span className="text-sm font-medium text-ink dark:text-zinc-100 md:text-base">{credits}</span>
                    </div>
                  </div>

                  <div className="border-t border-black/[0.08] pt-4 dark:border-white/[0.08]">
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted md:text-base">
                        Get more FASHN app credits with subscriptions starting at only $19.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/fiyatlandirma')}
                        className="group inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-xl bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_12px_-2px_rgba(175,162,158,0.35)] transition-all duration-200 ease-in-out hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_20px_-4px_rgba(210,170,175,0.5)]"
                      >
                        Upgrade Plan
                        <ArrowRight className="ml-2 h-4 w-4 transition-all group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

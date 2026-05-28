import { Mail, TriangleAlert, Trash2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name ?? 'User'
  )}&background=f4f4f5&color=18181b&size=128`

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Bu demo hesap silme işlemi sizi çıkış yaptırır ve yerel kullanıcı verisini temizler. Devam etmek istiyor musunuz?'
    )

    if (!confirmed) return

    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Account Settings</h1>
          <p className="text-sm text-muted">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-black/[0.08] bg-white/80 text-ink backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2),0_4px_16px_-4px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight text-ink sm:text-xl">
                <User className="h-5 w-5" />
                Profile Information
              </h3>
              <p className="text-sm text-muted">Your personal account details</p>
            </div>

            <div className="space-y-4 p-6 pt-0">
              <div className="flex items-center gap-4">
                <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-black/[0.06] bg-[var(--card-bg)]">
                  <img className="aspect-square h-full w-full object-cover" alt={user?.name ?? 'User'} src={avatarUrl} />
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted" />
                    <span className="font-medium text-ink">{user?.name ?? 'Kullanıcı'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted" />
                    <span className="text-muted">{user?.email ?? '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-black/[0.08] dark:bg-white/[0.08]" />

          <div className="rounded-[1.5rem] border border-red-500/30 bg-white/80 text-ink backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_-4px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2),0_4px_16px_-4px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight text-red-600 sm:text-xl dark:text-red-400">
                <TriangleAlert className="h-5 w-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-muted">Irreversible and destructive actions</p>
            </div>

            <div className="p-6 pt-0">
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <div>
                  <h4 className="font-medium text-ink">Delete Account</h4>
                  <p className="text-sm text-muted">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-xl bg-red-600 px-3 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-red-600/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-fit"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

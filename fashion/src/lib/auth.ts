/** API yanıtı (camelCase veya PascalCase) → oturum kullanıcısı */
export function normalizeAuthResponse(payload: Record<string, unknown> | null | undefined) {
  const id = payload?.id ?? payload?.Id
  const email = payload?.email ?? payload?.Email
  const displayName = payload?.displayName ?? payload?.DisplayName
  const emailStr = email != null ? String(email) : ''

  return {
    id: id != null ? String(id) : '',
    email: emailStr,
    name: displayName != null ? String(displayName) : emailStr.split('@')[0] || 'user',
    role: String(payload?.role ?? payload?.Role ?? 'user'),
    credits: Number(payload?.credits ?? payload?.Credits ?? 0),
    profilePhotoUrl: (payload?.profilePhotoUrl ?? payload?.ProfilePhotoUrl ?? null) as string | null,
  }
}

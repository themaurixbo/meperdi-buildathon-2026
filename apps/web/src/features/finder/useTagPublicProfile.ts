import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTagPublicProfile, registerScan } from '@meperdi/api-client'
import { track } from '../../lib/analytics'
import { collectDeviceInfo, tryGetPublicIp } from '../../lib/deviceInfo'

export function useTagPublicProfile(publicSlug: string) {
  const scanTracked = useRef(false)

  const query = useQuery({
    queryKey: ['tag-public-profile', publicSlug],
    queryFn: ({ signal }) => getTagPublicProfile(publicSlug, signal),
    retry: 1,
  })

  useEffect(() => {
    if (!query.data || scanTracked.current) return
    scanTracked.current = true
    track('tag_scanned', { tagStatus: query.data.tagStatus })

    // Nada de esto pide permiso al navegador: son propiedades que ya expone el
    // dispositivo, más una IP aproximada obtenida en segundo plano (sección 11, `scans`).
    void (async () => {
      const device = collectDeviceInfo()
      const ip = await tryGetPublicIp()
      void registerScan(publicSlug, { ...device, ip })
    })()
  }, [query.data, publicSlug])

  return query
}

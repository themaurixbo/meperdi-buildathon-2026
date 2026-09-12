import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:9999px;background:#7C3AED;border:3px solid white;box-shadow:0 4px 10px rgba(11,16,38,0.35)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

interface LocationMapProps {
  lat: number
  lng: number
  /** Se llama cuando el usuario arrastra el marcador o toca otro punto del mapa. */
  onMove?: (lat: number, lng: number) => void
  /** false para vistas de solo lectura (ej. el propietario viendo la ubicación de un aviso). */
  interactive?: boolean
  className?: string
}

/**
 * Mapa gratuito (Leaflet + OpenStreetMap, sin API key) para compartir ubicación —
 * F04/F05. El marcador arranca en la posición real del GPS y puede moverse a mano.
 */
export function LocationMap({ lat, lng, onMove, interactive = true, className }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      attributionControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const marker = L.marker([lat, lng], { icon: markerIcon, draggable: interactive }).addTo(map)
    if (interactive) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onMove?.(pos.lat, pos.lng)
      })
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        onMove?.(e.latlng.lat, e.latlng.lng)
      })
    } else {
      map.dragging.disable()
      map.scrollWheelZoom.disable()
      map.doubleClickZoom.disable()
    }

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Solo se inicializa una vez; los movimientos posteriores del marcador vienen del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return
    const current = markerRef.current.getLatLng()
    if (Math.abs(current.lat - lat) > 1e-9 || Math.abs(current.lng - lng) > 1e-9) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.panTo([lat, lng])
    }
  }, [lat, lng])

  return <div ref={containerRef} className={className} />
}

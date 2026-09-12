import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'

export type CameraScanState = 'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported' | 'error'

/**
 * Lectura de QR por cámara — A10/F: el permiso de cámara se pide solo al activar el
 * escáner, nunca al cargar la pantalla.
 */
export function useQrCameraScanner(onDecoded: (text: string) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [state, setState] = useState<CameraScanState>('idle')

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  async function start() {
    if (!videoRef.current) return
    setState('starting')

    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      setState('unsupported')
      return
    }

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => onDecoded(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          returnDetailedScanResult: true,
        },
      )
      scannerRef.current = scanner
      await scanner.start()
      setState('scanning')
    } catch (error) {
      const name = error instanceof Error ? error.name : ''
      setState(name === 'NotAllowedError' ? 'denied' : 'error')
    }
  }

  function stop() {
    scannerRef.current?.stop()
    setState('idle')
  }

  return { videoRef, state, start, stop }
}

import { useEffect, useRef, useState } from 'react'

export type CameraCaptureState = 'idle' | 'starting' | 'live' | 'denied' | 'error'

/**
 * Captura de foto por cámara — el permiso se pide solo al tocar "Tomar foto",
 * nunca automáticamente (principio de permisos, sección 4/A10).
 */
export function useCameraCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraCaptureState>('idle')

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function start() {
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1024 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setState('live')
    } catch (error) {
      const name = error instanceof Error ? error.name : ''
      setState(name === 'NotAllowedError' ? 'denied' : 'error')
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setState('idle')
  }

  /** Congela el cuadro actual del video en un canvas y devuelve un data URL JPEG. */
  function capture(): string | null {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    stop()
    return dataUrl
  }

  return { videoRef, state, start, stop, capture }
}

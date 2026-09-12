import { create } from 'zustand'

export type NetworkCondition = 'normal' | 'slow' | 'error' | 'offline'

interface DevScenarioState {
  networkCondition: NetworkCondition
  setNetworkCondition: (condition: NetworkCondition) => void
}

/**
 * Selector de escenario visible solo en desarrollo — sección 21.
 * Permite forzar carga lenta, error o desconexión sin cambiar de pantalla,
 * para probar los estados loading/error/offline exigidos en la sección 17.
 */
export const useDevScenarioStore = create<DevScenarioState>((set) => ({
  networkCondition: 'normal',
  setNetworkCondition: (networkCondition) => set({ networkCondition }),
}))

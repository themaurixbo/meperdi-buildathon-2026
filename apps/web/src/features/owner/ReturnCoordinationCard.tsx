import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Copy, HandHeart } from 'lucide-react'
import { confirmReturnCase, createReturnCase, generateHandoffCode, getMyReturnCase } from '@meperdi/api-client'
import { RETURN_CASE_STATUS_LABEL } from '@meperdi/domain'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useReturnCaseStore } from '../../stores/returnCaseStore'

/** R01–R06 (lado propietario) — coordinar, generar código y confirmar la devolución. */
export function ReturnCoordinationCard({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient()
  const returnCaseId = useReturnCaseStore((s) => s.caseByItemId[itemId])
  const setCase = useReturnCaseStore((s) => s.setCase)

  const caseQuery = useQuery({
    queryKey: ['return-case', returnCaseId],
    queryFn: () => getMyReturnCase(returnCaseId!),
    enabled: Boolean(returnCaseId),
    refetchInterval: 4000,
  })

  const startMutation = useMutation({
    mutationFn: () => createReturnCase({ itemId }),
    onSuccess: (result) => setCase(itemId, result.returnCaseId),
  })

  const codeMutation = useMutation({
    mutationFn: () => generateHandoffCode(returnCaseId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-case', returnCaseId] }),
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmReturnCase(returnCaseId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['return-case', returnCaseId] }),
  })

  if (!returnCaseId) {
    return (
      <Card className="bg-violet/5">
        <p className="text-[15px] font-bold text-ink">¿Ya encontraron tu tag?</p>
        <p className="mt-1 text-[15px] text-muted">Inicia la coordinación segura de devolución.</p>
        <Button size="compact" className="mt-3" loading={startMutation.isPending} onClick={() => startMutation.mutate()}>
          <HandHeart size={18} aria-hidden="true" /> Iniciar devolución
        </Button>
      </Card>
    )
  }

  const returnCase = caseQuery.data

  return (
    <Card>
      <p className="text-[15px] font-bold text-ink">Devolución en curso</p>
      {returnCase && (
        <p className="mt-1 text-[15px] text-muted">Estado: {RETURN_CASE_STATUS_LABEL[returnCase.status]}</p>
      )}

      {returnCase?.status === 'proposed' && (
        <Button size="compact" className="mt-3" loading={codeMutation.isPending} onClick={() => codeMutation.mutate()}>
          Generar código de entrega
        </Button>
      )}

      {returnCase?.handoffCode && (returnCase.status === 'accepted' || returnCase.status === 'proposed') && (
        <div className="mt-3 rounded-field bg-night/5 p-3">
          <p className="text-[13px] text-muted">Código para quien entrega:</p>
          <p className="text-[28px] font-extrabold tracking-widest text-ink">{returnCase.handoffCode}</p>
          <ShareLink path={`/return/${returnCase.caseToken}`} />
        </div>
      )}

      {returnCase?.status === 'in_transit' && (
        <Button size="compact" className="mt-3" loading={confirmMutation.isPending} onClick={() => confirmMutation.mutate()}>
          ¿Ya volvió contigo? Confirmar
        </Button>
      )}

      {returnCase?.status === 'delivered' && returnCase.claimToken && (
        <div className="mt-3 flex items-center gap-2 text-[15px] font-bold text-[#0b6b58]">
          <CheckCircle2 size={20} aria-hidden="true" /> ¡Volvió a casa! Comparte el premio:
          <ShareLink path={`/reward/${returnCase.claimToken}`} />
        </div>
      )}
    </Card>
  )
}

function ShareLink({ path }: { path: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(url)}
      className="mt-2 flex items-center gap-1 text-[13px] font-bold text-violet underline"
    >
      <Copy size={14} aria-hidden="true" /> Copiar enlace {path}
    </button>
  )
}

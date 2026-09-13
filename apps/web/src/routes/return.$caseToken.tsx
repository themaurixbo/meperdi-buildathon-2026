import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, MapPin, Wallet } from 'lucide-react'
import {
  getPublicReturnCase,
  verifyHandoffCode,
  completeChainReturn,
} from '@meperdi/api-client'
import { RETURN_CASE_STATUS_LABEL } from '@meperdi/domain'
import { Screen } from '../components/ui/Screen'
import { Card } from '../components/ui/Card'
import { TextField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { PhotoFrame } from '../components/ui/PhotoFrame'
import { CardSkeleton, ErrorState } from '../components/ui/StateViews'
import { ProcessLoader } from '../components/ui/ProcessLoader'
import { useNoIndex } from '../lib/useNoIndex'

export const Route = createFileRoute('/return/$caseToken')({
  component: ReturnCaseScreen,
})

/** R02/R03/R04 — Punto de encuentro, estado del caso y código de entrega (lado finder). */
function ReturnCaseScreen() {
  useNoIndex()
  const { caseToken } = Route.useParams()
  const query = useQuery({
    queryKey: ['public-return-case', caseToken],
    queryFn: () => getPublicReturnCase(caseToken),
    refetchInterval: 5000,
  })
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [claimResult, setClaimResult] = useState<{
    txHash: string
    explorerUrl: string
    rewardAmount: string
  } | null>(null)

  const verifyMutation = useMutation({
    mutationFn: () => verifyHandoffCode(caseToken, { code }),
    onSuccess: (result) => setVerified(result.valid),
  })

  const claimMutation = useMutation({
    mutationFn: () =>
      completeChainReturn({
        caseId: query.data!.caseId,
        code,
        helperAddress: walletAddress,
      }),
    onSuccess: (result) => setClaimResult(result),
  })

  if (query.isPending) {
    return (
      <Screen className="pt-8">
        <CardSkeleton />
      </Screen>
    )
  }

  if (query.isError || !query.data) {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center">
        <ErrorState title="No encontramos este caso" description="Revisa el enlace que te compartieron." />
      </Screen>
    )
  }

  const { status, itemName, itemPhotoUrl, hasReward } = query.data

  return (
    <Screen className="pt-8 text-center">
      <PhotoFrame src={itemPhotoUrl} alt={itemName} className="mx-auto h-28 w-28" />
      <h1 className="mt-4 text-[24px] font-extrabold text-ink">Devolución de {itemName}</h1>
      <p className="mt-1 text-[15px] font-semibold text-violet">{RETURN_CASE_STATUS_LABEL[status]}</p>

      <Card className="mt-5 flex items-start gap-3 text-left">
        <MapPin size={20} className="mt-0.5 shrink-0 text-violet" aria-hidden="true" />
        <p className="text-[15px] text-muted">
          Una buena acción está por completarse. Elige un lugar público, con gente alrededor. Nunca compartas tu
          domicilio exacto.
        </p>
      </Card>

      {status === 'proposed' && (
        <Card className="mt-4 bg-night/5 text-[15px] text-muted">
          El propietario está preparando el código de entrega. Vuelve a esta página en unos minutos.
        </Card>
      )}

      {status === 'accepted' && !verified && (
        <form
          className="mt-5 flex flex-col items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            verifyMutation.mutate()
          }}
        >
          <div className="w-full">
            <TextField
              label="Código de 6 dígitos que te dio el propietario"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              error={verifyMutation.isSuccess && !verifyMutation.data?.valid ? 'El código no es correcto.' : undefined}
            />
          </div>
          <Button type="submit" loading={verifyMutation.isPending} className="w-full">
            Confirmar entrega
          </Button>
        </form>
      )}

      {(status === 'in_transit' || verified) && (
        <Card className="mt-4 flex items-center justify-center gap-2 bg-aqua/10 text-[15px] font-bold text-[#0b6b58]">
          <CheckCircle2 size={20} aria-hidden="true" /> Código verificado. Esperando confirmación del propietario.
        </Card>
      )}

      {status === 'delivered' && (
        <>
          <Card className="mt-4 flex items-center justify-center gap-2 bg-lime/20 text-[15px] font-bold text-[#4b5400]">
            <CheckCircle2 size={20} aria-hidden="true" /> ¡Volvió a casa! Gracias por tu ayuda.
          </Card>

          {hasReward && !claimResult && (
            <Card className="mt-4 p-4 text-left bg-violet/5 border-violet/20">
              <h3 className="text-[15px] font-semibold text-violet flex items-center gap-2">
                <Wallet size={18} aria-hidden="true" /> Recompensa on-chain disponible
              </h3>
              <p className="mt-2 text-[14px] text-muted">
                El dueño ofreció una recompensa en mUSDC (token de prueba). Ingresa tu dirección de wallet para recibirla.
              </p>
              <div className="mt-3 flex flex-col gap-3">
                <TextField
                  label="Tu dirección de wallet (0x...)"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value.trim())}
                  error={claimMutation.isError ? 'Dirección inválida.' : undefined}
                />
                <Button
                  type="button"
                  loading={claimMutation.isPending}
                  className="w-full"
                  onClick={() => claimMutation.mutate()}
                >
                  Recibir recompensa
                </Button>
              </div>
            </Card>
          )}

          {claimResult && (
            <Card className="mt-4 p-4 text-left bg-emerald/5 border-emerald/20">
              <h3 className="text-[15px] font-semibold text-emerald flex items-center gap-2">
                <CheckCircle2 size={18} aria-hidden="true" /> Recompensa recibida
              </h3>
              <p className="mt-2 text-[14px] font-mono text-sm">{claimResult.rewardAmount} mUSDC</p>
              <p className="mt-1 text-[13px] text-muted">
                Transacción: <a href={claimResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="underline">{claimResult.txHash.slice(0, 10)}...</a>
              </p>
            </Card>
          )}
        </>
      )}

      {verifyMutation.isPending && (
        <ProcessLoader
          status="loading"
          title="Confirmando la entrega"
          description="Estamos verificando el código de entrega que te dio el propietario."
        />
      )}

      {claimMutation.isPending && (
        <ProcessLoader
          status="loading"
          title="Confirmando la devolución"
          description="Confirmando la transacción y liberando la recompensa desde el contrato de custodia."
          networkBadge="HSK Chain"
        />
      )}

      {claimMutation.isError && (
        <ProcessLoader
          status="error"
          title="No se pudo completar la transacción"
          description="La operación no se completó."
          errorMessage={claimMutation.error.message}
          networkBadge="HSK Chain"
          onDismiss={() => claimMutation.reset()}
        />
      )}
    </Screen>
  )
}
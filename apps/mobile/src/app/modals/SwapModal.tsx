import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BiometricsIcon } from 'src/components/icons/BiometricsIcon'
import { useBiometricAppSettings, useBiometricPrompt, useOsBiometricAuthEnabled } from 'src/features/biometrics/hooks'
import { closeModal } from 'src/features/modals/modalSlice'
import { selectModalState } from 'src/features/modals/selectModalState'
import { useWalletRestore } from 'src/features/wallet/hooks'
import { ModalName } from 'uniswap/src/features/telemetry/constants'
import { updateSwapStartTimestamp } from 'uniswap/src/features/timing/slice'
import { WalletSwapFlow } from 'wallet/src/features/transactions/swap/WalletSwapFlow'
import { useSwapPrefilledState } from 'wallet/src/features/transactions/swap/hooks/useSwapPrefilledState'

export function SwapModal(): JSX.Element {
  const appDispatch = useDispatch()
  const { initialState } = useSelector(selectModalState(ModalName.Swap))

  const onClose = useCallback((): void => {
    appDispatch(closeModal({ name: ModalName.Swap }))
  }, [appDispatch])

  // Update flow start timestamp every time modal is opened for logging
  useEffect(() => {
    appDispatch(updateSwapStartTimestamp({ timestamp: Date.now() }))
  }, [appDispatch])

  const { openWalletRestoreModal, walletNeedsRestore } = useWalletRestore()

  const swapPrefilledState = useSwapPrefilledState(initialState)

  const { requiredForTransactions: requiresBiometrics } = useBiometricAppSettings()
  const { trigger: biometricsTrigger } = useBiometricPrompt()

  return (
    <WalletSwapFlow
      BiometricsIcon={<SwapBiometricsIcon />}
      authTrigger={requiresBiometrics ? biometricsTrigger : undefined}
      openWalletRestoreModal={openWalletRestoreModal}
      prefilledState={swapPrefilledState}
      walletNeedsRestore={Boolean(walletNeedsRestore)}
      onClose={onClose}
    />
  )
}

function SwapBiometricsIcon(): JSX.Element | null {
  const isBiometricAuthEnabled = useOsBiometricAuthEnabled()
  const { requiredForTransactions } = useBiometricAppSettings()

  return isBiometricAuthEnabled && requiredForTransactions ? <BiometricsIcon /> : null
}

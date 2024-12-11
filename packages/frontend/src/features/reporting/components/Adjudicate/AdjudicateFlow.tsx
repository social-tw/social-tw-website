import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AdjudicateFormValues, ReportData } from './AdjudicateForm'
import AdjudicateDialog from './AdjudicateDialog'
import AdjudicatePending from './AdjudicatePending'
import AdjudicateFailure from './AdjudicateFailure'
import ConfirmationDialog from '../AdjudicateNotification/ConfirmationDialog'
import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg'
import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'
import { ReactComponent as CloseIcon } from '@/assets/svg/close-button.svg'

interface IntroDialogProps {
    onNext: () => void
    onClose: () => void
}

interface AdjudicateButtonProps {
    onClick: () => void
    onClose: () => void
}

type AdjudicateStage =
    | 'button'
    | 'intro'
    | 'details'
    | 'pending'
    | 'complete'
    | null
type AdjudicateStatus = 'idle' | 'pending' | 'success' | 'error'

const IntroDialog: React.FC<IntroDialogProps> = ({ onNext, onClose }) => {
    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-xl bg-white rounded-xl p-6">
                    <Dialog.Title className="text-xl font-bold mb-4">
                        協助評判說明
                    </Dialog.Title>

                    <p className="mb-4">
                        您即將協助評判一則檢舉案件。請仔細閱讀內容並做出公正判斷。
                        您的決定將影響社群的健康發展。
                    </p>
                    <p className="mb-6">評判完成後將獲得評判積分獎勵。</p>

                    <div className="flex justify-end gap-4">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                            onClick={onClose}
                        >
                            取消
                        </button>
                        <button
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                            onClick={onNext}
                        >
                            查看案件詳情
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

const AdjudicateButton: React.FC<AdjudicateButtonProps> = ({
    onClick,
    onClose,
}) => {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block"
        >
            {/* Main Button */}
            <button
                className="relative py-2 pl-12 pr-2 bg-black border border-white rounded-lg lg:py-3 lg:pr-4 lg:pl-14 drop-shadow hover:bg-gray-900 transition-colors"
                onClick={onClick}
            >
                <GavelRaisedIcon className="absolute bottom-0 -left-3 w-[4.5rem] lg:w-[5.25rem] h-auto" />
                <div className="inline-flex flex-col items-start">
                    <span className="text-base font-bold leading-tight tracking-normal text-white lg:tracking-wider lg:text-lg">
                        新檢舉案出現
                    </span>
                    <span className="text-xs font-medium leading-tight text-white lg:text-sm">
                        <ArrowRight className="inline-block w-3 lg:w-auto mr-0.5 lg:mr-1" />
                        立即前往評判！
                    </span>
                </div>
            </button>

            {/* Close Button */}
            <button
                className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center
                        bg-white rounded-full border border-gray-300 shadow-md hover:bg-gray-100"
                onClick={onClose}
            >
                <CloseIcon className="w-4 h-4 text-black" />
            </button>
        </motion.div>
    )
}

const CompletionCard: React.FC = () => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
        >
            <h3 className="text-lg font-bold mb-2">評判完成</h3>
            <p className="text-gray-600">
                感謝您的協助評判！您已獲得評判積分獎勵。
            </p>
        </motion.div>
    )
}

interface AdjudicateFlowProps {
    reportData?: ReportData
    onRefetch?: () => void
}

export default function AdjudicateFlow({
    reportData,
    onRefetch,
}: AdjudicateFlowProps) {
    const [stage, setStage] = useState<AdjudicateStage>('button')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)
    const [adjudicateStatus, setAdjudicateStatus] =
        useState<AdjudicateStatus>('idle')

    const handleAbandon = () => {
        setConfirmOpen(false)
        setButtonVisible(false)
        onRefetch?.()
    }

    const handleContinue = () => {
        setConfirmOpen(false)
        setStage('intro')
    }

    const handleAdjudicateComplete = () => {
        setAdjudicateStatus('success')
        setStage('complete')
        onRefetch?.()
    }

    const handleClose = () => {
        setStage('button')
        setButtonVisible(true)
        setAdjudicateStatus('idle')
    }

    const openConfirmation = () => {
        setConfirmOpen(true)
    }

    const renderStageContent = () => {
        switch (stage) {
            case 'button':
                return (
                    buttonVisible && (
                        <AdjudicateButton
                            onClick={() => setStage('intro')}
                            onClose={openConfirmation}
                        />
                    )
                )

            case 'intro':
                return (
                    <IntroDialog
                        onNext={() => setStage('details')}
                        onClose={handleClose}
                    />
                )

            case 'details':
                return reportData ? (
                    <AdjudicateDialog
                        reportData={reportData}
                        open={true}
                        onClose={handleClose}
                        onSubmit={(values: AdjudicateFormValues) => {
                            handleAdjudicateComplete()
                        }}
                    />
                ) : null

            case 'pending':
                return (
                    <AdjudicatePending
                        open={adjudicateStatus === 'pending'}
                        onClose={handleClose}
                    />
                )

            case 'complete':
                return <CompletionCard />

            default:
                return null
        }
    }

    if (!reportData) {
        return null
    }

    return (
        <>
            <AnimatePresence>{renderStageContent()}</AnimatePresence>

            <ConfirmationDialog
                open={confirmOpen}
                onConfirm={handleAbandon}
                onCancel={handleContinue}
                onClose={() => setConfirmOpen(false)}
            />

            {adjudicateStatus === 'error' && (
                <AdjudicateFailure
                    open={true}
                    onClose={() => {
                        setAdjudicateStatus('idle')
                        handleClose()
                    }}
                />
            )}
        </>
    )
}

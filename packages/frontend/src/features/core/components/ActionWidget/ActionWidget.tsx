import EpochImg from '@/assets/img/epoch.png'
import ActionCounter from './ActionCounter'
import ActionMessage from './ActionMessage'
import ActionTracker from './ActionTracker'
import EpochTimer from './EpochTimer'

export default function ActionWidget() {
    return (
        <div className="space-y-2" data-tour-step="1">
            <div className="flex items-stretch gap-2">
                <img
                    className="w-16 h-16 basis-16 shrink-0"
                    src={EpochImg}
                    alt="epoch actions"
                />
                <div className="flex-1 space-y-1.5" data-tour-step="2">
                    <div className="flex gap-2">
                        <div className="w-28 basis-28">
                            <EpochTimer />
                        </div>
                        <div className="flex-1">
                            <ActionCounter />
                        </div>
                    </div>
                    <ActionMessage />
                </div>
            </div>
            <ActionTracker />
        </div>
    )
}

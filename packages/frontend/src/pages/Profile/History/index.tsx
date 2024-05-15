import TabContent from './TabContent'
import TabFilter from './TabFilter'
import TabHeader from './TabHeader'

export const History = () => {
    return (
        <div className={`h-full grid grid-rows-[auto_auto_1fr]`}>
            <TabHeader />
            <TabFilter />
            <TabContent />
        </div>
    )
}

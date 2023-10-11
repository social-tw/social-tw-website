import { useEffect, useState } from "react";
import { useUser } from "../contexts/User";

const epochLength = 300000

export default function useEpoch() {
    const [remainingTime, setRemainingTime] = useState<number>()
    const { userState } = useUser()

    useEffect(() => {
        async function load() {
            if (!userState) return
            const time = await userState.sync.calcEpochRemainingTime()
            console.log(time)
            setRemainingTime(time)
        }
        load()
    }, [userState])

    return {
        remainingTime,
        epochLength
    }
}
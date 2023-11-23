import { useEffect, useState } from "react";
import { useUser } from "../contexts/User";

const epochLength = 300

export default function useEpoch() {
    const [epoch, setEpoch] = useState<number>();
    const [remainingTime, setRemainingTime] = useState<number>();
    const { userState } = useUser();

    useEffect(() => {
        if (!userState) return;

        let timer: number;
        function loadEpoch() {
            if (!userState) return;

            const _remainingTime = userState.sync.calcEpochRemainingTime();
            const _epoch = userState.sync.calcCurrentEpoch();
            setEpoch(_epoch);
            setRemainingTime(_remainingTime);

            timer = window.setTimeout(loadEpoch, _remainingTime * 1000);
        }

        loadEpoch()

        return () => {
            clearTimeout(timer);
        }
    }, [userState])

    return {
        epochLength,
        epoch,
        remainingTime,
    }
}

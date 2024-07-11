import { MutationKeys } from "@/constants/queryKeys";
import { useMutation } from "@tanstack/react-query";

export function useCheckIn() {
    return useMutation({
        mutationKey: [MutationKeys.CheckIn],
        mutationFn: async () => {},
    })
}

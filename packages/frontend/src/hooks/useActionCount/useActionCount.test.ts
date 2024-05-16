import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper";
import { useActionCount } from "./useActionCount";
import nock from 'nock';
import { SERVER } from '@/config';

jest.mock('@/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            getEpochKeys: jest.fn().mockReturnValue(['epochKey-1', 'epochKey-2'].join(',')),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
                calcEpochRemainingTime: jest.fn().mockReturnValue(120),
            },
        },
    }),
}))

describe('useActionCount', () => {
    it('should get action count', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { transaction: '0xtransaction'})
        
        const { result } = renderHook(useActionCount, { wrapper })

        await waitFor(() => expect(result.current).not.toBeNaN())

        expectation.done()
    })
})

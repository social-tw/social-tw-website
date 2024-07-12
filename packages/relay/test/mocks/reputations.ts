import { ReputationType } from '../../src/types/Reputation'

export const reputationData = [
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b1',
        epoch: 1,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: 3,
        type: ReputationType.REPORT_SUCCESS,
        reportId: '1',
    },
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b2',
        epoch: 2,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: -1,
        type: ReputationType.REPORT_FAILURE,
        reportId: '1',
    },
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b3',
        epoch: 3,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: -5,
        type: ReputationType.BE_REPORTED,
        reportId: '1',
    },
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b4',
        epoch: 4,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: 1,
        type: ReputationType.ADJUDICATE,
        reportId: '1',
    },
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b5',
        epoch: 5,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: 1,
        type: ReputationType.ADJUDICATE,
        reportId: '1',
    },
    {
        transactionHash:
            '0x3b8e0cbaba42a43e0171b630b5a5ce3334e3c8ca4e9ef21fd18c1cc4920130b6',
        epoch: 6,
        epochKey:
            '8863230909908831784895190891539701510633570126451149109726982561814983587699',
        score: 1,
        type: ReputationType.ADJUDICATE,
        reportId: '1',
    },
]

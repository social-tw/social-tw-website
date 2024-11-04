import { type Step } from 'react-joyride'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface TourState {
    run: boolean
    stepIndex: number
    steps: Step[]
}

const steps: Step[] = [
    {
        title: '動作操作計數區塊',
        content: '此區塊為 Unirep Social Taiwan 特有的動作操作計數區塊，方便你快速辨識平台上的操作動作的相關資訊，以防止身份被辨識。在平台中，每 5 分鐘為一個 Epoch，每個 Epoch 內你可使用 3 把 Epoch Keys （一種隨機生成的身份標示符，用來識別用戶在特定 Epoch 期間的行為）來執行各種操作',
        target: '[data-tour-step="1"]',
        placement: 'auto',
        disableBeacon: true,
    },
    {
        title: '動作操作計數條',
        content: '發文、按讚、留言、檢舉和評判等每個操作都會使用到 1 把 Epoch Key。若在各 Epoch 內進行超過 3 個操作，將重複使用 Epoch Key，此時可能增加交叉比對的可行性，從而提高身份被識別的風險。此計數條幫助你辨識當前 Epoch 內的操作次數',
        target: '[data-tour-step="2"]',
        placement: 'left',
        disableBeacon: true,
    },
    {
        title: '上鏈交易進度與狀態',
        content: '計數區底部會顯示最新的操作行為，以及該操作的上鏈交易（Transaction，是指將某一筆交易或動作記錄永久寫入區塊鏈的過程）進度與狀態。最右方橘色框中的數字代表當前進行中的上鏈交易數量',
        target: '[data-tour-step="3"]',
        placement: 'left',
        disableBeacon: true,
    },
    {
        title: '貼文卡片 & 隨機身份',
        content: '在貼文首頁中可以瀏覽所有貼文的貼文卡片。貼文卡片上會顯示該篇貼文作者的「隨機身份」頭貼、發表時間、完整內容或局部內容、按讚數、倒讚數、留言數等資訊。為保護你的隱私與身份，會在每個動作被執行時賦予你新的隨機身份， 因此你的用戶頭像圖片會是隨機生成的，並且每次都會不一樣',
        target: '[data-tour-step="4"]',
        placement: 'bottom',
        disableBeacon: true,
    },
    {
        title: '檢舉不當貼文',
        content: '當你有看到不當的貼文內容，你可以透過該貼文卡片的右上角的三個小圓點按鈕呼叫出檢舉按鈕進行檢舉。當檢舉送出後，將交由 5 位隨機用戶進行檢舉內容的評判審核。若檢舉通過，你的聲譽分數將提高 3 分，反之，則您的聲譽分數會降低 1 分',
        target: '[data-tour-step="5"]',
        placement: 'bottom-end',
        disableBeacon: true,
    },
    {
        title: '恭喜瀏覽完所有介紹！🙌🏻',
        content: '恭喜你看完所有功能與特色介紹，希望對你使用 Unirep Social Taiwan 是有幫助的！若後續在使用時還有不太清楚明白的地方，可以參閱「平台說明」的頁面去查看相關資訊',
        target: '[data-tour-step="6"]',
        placement: 'left-start',
        disableBeacon: true,
    },
]

const initialState: TourState = {
    run: false,
    stepIndex: 0,
    steps,
}

export const useTourStore = create<TourState>()(immer(() => initialState))

export function openTour() {
    useTourStore.setState({ run: true })
}

export function closeTour() {
    useTourStore.setState({ run: false })
}

export function resetTour() {
    useTourStore.setState({ run: false, stepIndex: 0 })
}

export function prevStep() {
    useTourStore.setState((state) => {
        state.stepIndex -= 1
    })
}

export function nextStep() {
    useTourStore.setState((state) => {
        state.stepIndex += 1
    })
}

export function jumpStep(stepIndex: number) {
    useTourStore.setState({ stepIndex })
}

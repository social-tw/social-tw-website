import '@/assets/css/main.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'

dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

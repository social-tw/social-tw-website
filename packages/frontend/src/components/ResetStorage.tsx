import { LocalStorageHelper } from '@/utils/LocalStorageHelper'
import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'

export default function ResetStorage() {
    const error = useRouteError() as Error
    const navigate = useNavigate()

    useEffect(() => {
        if (error) {
            LocalStorageHelper.removeSignature()
            LocalStorageHelper.removeIsTwitterVerified()
            LocalStorageHelper.removeHashUserId()
            LocalStorageHelper.removeAccessToken()
            LocalStorageHelper.removeSignMsg()
            console.log('reload page')
            navigate(0)
        }
    }, [error, navigate])

    return null
}

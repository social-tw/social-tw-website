import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import {
    ReportFormStepContent,
    ReportFormStepErrorHint,
} from './ReportFormStep'

interface ReportFormDescProps {
    register: UseFormRegister<FieldValues>
    errors: FieldErrors<FieldValues>
}

export const REGISTER_ID = 'desc'

export function ReportFormDesc({ register, errors }: ReportFormDescProps) {
    const hasError = errors[REGISTER_ID]
    return (
        <ReportFormStepContent>
            <textarea
                {...register(REGISTER_ID, { required: true, minLength: 10 })}
                className="w-full h-32 resize-none rounded-lg border border-gray-300 p-4 mb-[-5px]"
                placeholder="請於此填寫檢舉原因，至少10個字"
            />
            {hasError && (
                <ReportFormStepErrorHint msg={'檢舉描述長度至少為10個字'} />
            )}
        </ReportFormStepContent>
    )
}

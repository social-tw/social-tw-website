import { wrapper } from "@/utils/test-helpers/wrapper"
import { render, screen } from "@testing-library/react"
import CheckIn from "./CheckIn"

describe("CheckIn", () => {
    it("renders CheckInDialog when open and not cancel", () => {
        render(<CheckIn open={true} cancel={false} />, { wrapper })

        expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("renders CheckInCancellation when open and cancel", () => {
        render(<CheckIn open={true} cancel={true} />, { wrapper })

        expect(screen.getByRole("dialog")).toBeInTheDocument()
    })
})

import { expect, test } from "@playwright/test";

test.describe('Post list', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should go to create post page', async ({ page }) => {
        const viewportWidth = page.viewportSize()?.width ?? 0
        test.skip(viewportWidth > 768, 'only test on Mobile')
        const createLink = page.getByTitle('create a post')
        await expect(createLink).toBeEnabled()
    })
})

test.describe('Create post', () => {
    test.beforeEach(async ({ page }) => {
        const viewportWidth = page.viewportSize()?.width ?? 0
        if (viewportWidth > 768) {
            await page.goto('/')
        } else {
            await page.goto('/write')
        }
    })

    test.skip('should not submit a post if content is empty', async ({
        page,
    }) => {
        const submitButton = page.getByTitle('submit a post')
        await expect(submitButton).toBeDisabled()
    })

    test('should let user input post contents', async ({ page }) => {
        const post = 'Hello World'
        const postEditor = page.getByLabel('post editor')
        const submitButton = page.getByTitle('submit a post')

        await postEditor.fill(post)
        await expect(submitButton).toBeEnabled()
    })

    test.skip('should let user choose epoch keys(or nonces)', async () => {
        // User is not allowed to choose epoch keys by themselves for now
    })

    test('should succeed to post', async ({ page }) => {
        await page.route('*/**/api/post', async (route) => {
            const post = route.request().postData()
            const json = [
                {
                    transaction: '0xhash',
                    currentEpoch: 'epoch',
                    post,
                },
            ]
            await route.fulfill({ json })
        })

        const post = 'Hello World'
        const postEditor = page.getByLabel('post editor')
        const submitButton = page.getByTitle('submit a post')

        await postEditor.fill(post)
        await submitButton.click()

        // await expect(page).toHaveURL('/')
    })

    test('should handle error message and return to correct status', async ({
        page,
    }) => {
        await page.route('*/**/api/post', async (route) => {
            await route.abort()
        })

        const post = 'Hello World'
        const postEditor = page.getByLabel('post editor')
        const submitButton = page.getByTitle('submit a post')

        await postEditor.fill(post)
        await submitButton.click()
    })
})

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
import { configMocks } from 'jsdom-testing-mocks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

configMocks({ act })

global.setImmediate =
    global.setImmediate ||
    ((fn: () => void, ...args: unknown[]) => global.setTimeout(fn, 0, ...args))

import React from 'react';
import Loading from '../layouts/Loading';
import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {expect} from "@jest/globals";

test("Background should render", () => {
    render(
        <Loading/>
    );
    // @ts-ignore
    expect(screen.getByText('我們正在努力為你加載，請稍等...')).toBeInTheDocument();
});
import React from 'react';
import Loading from '../layouts/Loading';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

test("Background should render", () => {
    render(
        <Loading/>
    );
    const element = screen.findAllByText('background');
    expect(element).toBeInTheDocument();
});
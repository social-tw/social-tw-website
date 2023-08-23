import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../../layouts/Navbar';
import { UserProvider } from '../../contexts/User';
import '@testing-library/jest-dom'
import {expect} from "@jest/globals";

test("Navbar should render", () => {
    render(
        <UserProvider>
            <Navbar />
        </UserProvider>
    );
    // @ts-ignore
    expect(screen.getByText('Unirep Social TW')).toBeInTheDocument();
});
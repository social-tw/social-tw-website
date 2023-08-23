import React from 'react';
import {render, screen} from '@testing-library/react';
import Login from '../../pages/Login';
import '@testing-library/jest-dom'
import {expect} from "@jest/globals";
import {MemoryRouter} from "react-router-dom";
import {UserProvider} from "../../contexts/User";

test("Login should render", () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <Login/>
            </UserProvider>
        </MemoryRouter>
    );
    // @ts-ignore
    expect(screen.getByAltText('UniRep Logo')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Unirep Social TW')).toBeInTheDocument();

    // ... Add more tests as needed ...
});

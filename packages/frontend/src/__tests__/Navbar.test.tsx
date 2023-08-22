import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../layouts/Navbar';
import { UserProvider } from '../contexts/User';

test("Navbar should render", () => {
    render(
        <UserProvider>
            <Navbar />
        </UserProvider>
    );

});
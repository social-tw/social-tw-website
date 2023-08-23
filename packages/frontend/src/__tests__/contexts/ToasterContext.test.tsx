import React from 'react';
import { render, screen } from '@testing-library/react';
import ToasterContext from '../../contexts/ToasterContext';
import '@testing-library/jest-dom'

test("ToasterContext should render", () => {
    render(
        <ToasterContext />
    );
});
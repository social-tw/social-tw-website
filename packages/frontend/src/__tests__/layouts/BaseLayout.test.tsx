import React from 'react';
import BaseLayout from '../../layouts/BaseLayout';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';

test('BaseLayout should render', () => {
    render(<BaseLayout />);
});

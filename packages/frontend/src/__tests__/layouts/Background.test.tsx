import React from 'react';
import { render, screen } from '@testing-library/react';
import Background from '../../layouts/Background';
import '@testing-library/jest-dom'

test("Background should render", () => {
  render(
        <Background />
  );
});
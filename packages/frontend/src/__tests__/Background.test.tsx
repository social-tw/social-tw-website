import React from 'react';
import { render, screen } from '@testing-library/react';
import Background from '../layouts/Background';

test("Background should render", () => {
  render(
        <Background />
  );
});
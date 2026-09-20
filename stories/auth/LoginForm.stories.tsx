/**
 * LoginForm 登入表單元件故事
 * LoginForm component stories
 *
 * 個別展示登入表單的各種狀態
 * Show login form in various states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { makeDarkDecorator } from '../decorators';
import { LoginForm } from '../../src/components/auth/LoginForm';

/** LoginForm 元件設定 / LoginForm component settings */
const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    // Storybook 裝飾器配置 / Storybook decorators configuration
    decorators: [
      makeDarkDecorator({ className: 'home-page', color: '#e0e0e0' }),
    ],
  },
  argTypes: {
    onLogin: { action: 'login' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本登入表單 / Basic login form */
export const Basic: Story = {
  args: {
    onLogin: (id, password) => console.log('Login:', id, password),
  },
};

/** 帶有預填值的登入表單 / Login form with pre-filled values */
export const WithDefaultValues: Story = {
  args: {
    onLogin: (id, password) => console.log('Login:', id, password),
    defaultId: 'player123',
    defaultPass: 'password123',
  },
};

/** 自訂新遊戲連結 / Custom new game URL */
export const CustomNewGameLink: Story = {
  args: {
    onLogin: (id, password) => console.log('Login:', id, password),
    newGameUrl: 'http://127.0.0.1:8085/game/custom',
  },
};

/** 登入成功狀態 / Login success state (simulated) */
export const LoginSuccess: Story = {
  args: {
    onLogin: (id, password) => {
      console.log('Successful login:', id, password);
      alert('Login successful!');
    },
    defaultId: 'success_user',
    defaultPass: 'correct_pass',
  },
};

/** 登入失敗狀態 / Login failure state (simulated) */
export const LoginFailure: Story = {
  args: {
    onLogin: (id, password) => {
      console.log('Failed login attempt:', id, password);
      alert('Login failed! Incorrect credentials.');
    },
  },
};

/** 無登入回調 / Without login callback */
export const WithoutLoginCallback: Story = {
  args: {
    onLogin: undefined,
  },
};
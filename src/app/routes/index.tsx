/**
 * App Routes
 *
 * @module app/routes
 */

import { lazy } from 'react';

// Lazy load pages (بدون استفاده از path aliasهای پیچیده)
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

export const routes = {
  home: HomePage,
  login: LoginPage,
  chat: ChatPage,
};
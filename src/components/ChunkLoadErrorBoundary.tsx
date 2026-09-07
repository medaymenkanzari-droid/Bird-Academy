/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { AppButton, AppCard } from './design-system';

interface Props {
  children: ReactNode;
  resetKey: string;
  title: string;
  message: string;
  reloadLabel: string;
}

interface State {
  error: Error | null;
}

const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk .* failed/i;
const RECOVERY_MARKER = 'bird_academy_chunk_recovery_attempted_at';
const RECOVERY_COOLDOWN_MS = 60_000;

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application module loading failed', error, errorInfo);
    if (!CHUNK_ERROR.test(error.message)) return;

    try {
      const previousAttempt = Number(sessionStorage.getItem(RECOVERY_MARKER) ?? 0);
      if (Date.now() - previousAttempt < RECOVERY_COOLDOWN_MS) return;
      sessionStorage.setItem(RECOVERY_MARKER, String(Date.now()));
    } catch {
      return;
    }

    void this.activateLatestVersion();
  }

  componentDidUpdate(previousProps: Props): void {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private async activateLatestVersion(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration?.update();
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.warn('Unable to activate the latest service worker before reload', error);
    } finally {
      window.location.reload();
    }
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert">
        <AppCard className="mx-auto max-w-xl p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{this.props.title}</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{this.props.message}</p>
          <AppButton
            className="mt-6"
            startIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => window.location.reload()}
          >
            {this.props.reloadLabel}
          </AppButton>
        </AppCard>
      </div>
    );
  }
}

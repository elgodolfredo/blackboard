<script lang="ts">
  import { loginWithGoogle } from './authService'

  interface Props {
    onLoginSuccess: () => void
  }

  let { onLoginSuccess }: Props = $props()

  let error: string = $state('')
  let loading: boolean = $state(false)

  async function handleGoogleLogin(): Promise<void> {
    error = ''
    loading = true

    try {
      await loginWithGoogle()
      onLoginSuccess()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      error = errorMsg
    } finally {
      loading = false
    }
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>Blackboard</h1>
    <p class="subtitle">Sign in with your Google account</p>

    <button onclick={handleGoogleLogin} disabled={loading} class="google-btn">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}
  </div>
</div>

<style>
  .login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-primary);
  }

  .login-box {
    background: var(--bg-secondary);
    border: 3px solid var(--border-color);
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .subtitle {
    text-align: center;
    margin: 0 0 2rem 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .error-message {
    background-color: var(--error-bg);
    color: var(--error-text);
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.95rem;
    margin-top: 1rem;
    text-align: center;
  }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    background-color: transparent;
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .google-btn:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
  }

  .google-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }
</style>

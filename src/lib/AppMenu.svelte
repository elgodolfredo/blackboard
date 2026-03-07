<script lang="ts">
  import { toggleTheme, getTheme, subscribeToThemeChanges } from './themeService'
  import type { Theme } from './themeService'

  interface Props {
    onBackToBoards: () => void
    onLogout: () => void
  }

  let { onBackToBoards, onLogout }: Props = $props()

  let isOpen = $state(false)
  let currentTheme: Theme = $state(getTheme())

  // Subscribe to theme changes
  $effect(() => {
    const unsubscribe = subscribeToThemeChanges((theme) => {
      currentTheme = theme
    })
    return () => unsubscribe()
  })

  function toggleMenu(): void {
    isOpen = !isOpen
  }

  function handleToggleTheme(): void {
    toggleTheme()
    isOpen = false
  }

  function handleBackToBoards(): void {
    onBackToBoards()
    isOpen = false
  }

  function handleLogout(): void {
    onLogout()
    isOpen = false
  }
</script>

<div class="app-menu-container">
  <button class="menu-button" onclick={toggleMenu} title="Menu">
    <i class="fas fa-bars"></i>
  </button>

  {#if isOpen}
    <div class="menu-dropdown">
      <button class="menu-item" onclick={handleToggleTheme} title="Toggle theme">
        {#if currentTheme === 'light'}
          <i class="fas fa-moon"></i>
        {:else}
          <i class="fas fa-sun"></i>
        {/if}
        <span>{currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>
      <button class="menu-item" onclick={handleBackToBoards}>
        <i class="fas fa-arrow-left"></i>
        <span>Back to Boards</span>
      </button>
      <button class="menu-item logout-item" onclick={handleLogout}>
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .app-menu-container {
    position: relative;
  }

  .menu-button {
    font-size: 1.25rem;
    padding: 0.5rem;
    border: 2px solid var(--border-color);
    background-color: transparent;
    color: var(--text-primary);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

  .menu-button:hover {
    background-color: var(--bg-tertiary);
  }

  .menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 4px;
    min-width: 180px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    margin-top: 0.5rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: background-color 0.2s;
  }

  .menu-item:hover {
    background-color: var(--bg-tertiary);
  }

  .menu-item.logout-item:hover {
    background-color: var(--error-bg);
    color: var(--error-text);
  }

  .menu-item i {
    width: 1.25rem;
    text-align: center;
  }

  .menu-dropdown .menu-item:first-child {
    border-bottom: 1px solid var(--border-color);
  }
</style>

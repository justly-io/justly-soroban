"use client";

import { BlockchainPlugin } from "./types";

/**
 * Plugin Registry - Manages blockchain plugin registration and activation
 */
class PluginRegistry {
  private plugins = new Map<string, BlockchainPlugin>();
  private activePlugin: BlockchainPlugin | null = null;

  /**
   * Register a blockchain plugin
   */
  register(plugin: BlockchainPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.name, plugin);
    console.log(`[PluginRegistry] Registered plugin: ${plugin.name}`);
  }

  /**
   * Activate a registered plugin
   */
  async activate(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      throw new Error(
        `Plugin "${name}" not found. Available plugins: ${Array.from(this.plugins.keys()).join(", ")}`
      );
    }

    console.log(`[PluginRegistry] Activating plugin: ${name}`);
    await plugin.initialize();
    this.activePlugin = plugin;
    console.log(`[PluginRegistry] Plugin ${name} activated successfully`);
  }

  /**
   * Get the currently active plugin
   */
  getActivePlugin(): BlockchainPlugin {
    if (!this.activePlugin) {
      throw new Error(
        "No blockchain plugin is active. Call registry.activate() first."
      );
    }
    return this.activePlugin;
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugin names
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Deactivate the current plugin
   */
  deactivate(): void {
    if (this.activePlugin) {
      console.log(`[PluginRegistry] Deactivating plugin: ${this.activePlugin.name}`);
      this.activePlugin = null;
    }
  }
}

// Export singleton instance
export const registry = new PluginRegistry();

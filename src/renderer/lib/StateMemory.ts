import React from 'react';

/**
 * Experimental class for storing ephemeral visual state for certain components
 *
 * Namely used by ResizablePanes right now to memorize sizes
 */
export default class StateMemory<T> {
  private memory: { [s: string]: T };

  constructor() {
    this.memory = {};
  }

  hookToComponent(component: React.Component<any, T>, key: string | undefined, def: T) {
    if (key === undefined) {
      return def;
    }

    const origComponentDidUpdate = component.componentDidUpdate;
    const self = this;
    component.componentDidUpdate = function componentDidUpdate(...args) {
      self.memory[key] = component.state;
      origComponentDidUpdate?.apply(this, args);
    };
    if (this.memory[key] === undefined) {
      this.memory[key] = def;
    }
    return this.memory[key];
  }
}

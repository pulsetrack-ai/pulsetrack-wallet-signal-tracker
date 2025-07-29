/**
 * Event Emitter Utility
 * Provides event handling capabilities for wallet tracking services
 */

export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     */
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const listeners = this.events.get(event);
        listeners.push(listener);
        
        if (listeners.length > this.maxListeners) {
            console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.length} ${event} listeners added.`);
        }
        
        return this;
    }

    /**
     * Add one-time event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.removeListener(event, onceWrapper);
        };
        
        this.on(event, onceWrapper);
        return this;
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function to remove
     */
    removeListener(event, listener) {
        if (!this.events.has(event)) {
            return this;
        }
        
        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        if (listeners.length === 0) {
            this.events.delete(event);
        }
        
        return this;
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        
        return this;
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...any} args - Arguments to pass to listeners
     */
    emit(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }
        
        const listeners = this.events.get(event).slice();
        
        for (const listener of listeners) {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`EventEmitter error in ${event} listener:`, error);
            }
        }
        
        return true;
    }

    /**
     * Get listener count for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        if (!this.events.has(event)) {
            return 0;
        }
        
        return this.events.get(event).length;
    }

    /**
     * Get all listeners for an event
     * @param {string} event - Event name
     * @returns {Function[]} Array of listeners
     */
    listeners(event) {
        if (!this.events.has(event)) {
            return [];
        }
        
        return this.events.get(event).slice();
    }

    /**
     * Get all event names
     * @returns {string[]} Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Set maximum number of listeners
     * @param {number} max - Maximum listeners
     */
    setMaxListeners(max) {
        this.maxListeners = max;
        return this;
    }

    /**
     * Get maximum number of listeners
     * @returns {number} Maximum listeners
     */
    getMaxListeners() {
        return this.maxListeners;
    }

    /**
     * Prepend listener to the beginning of listeners array
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     */
    prependListener(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).unshift(listener);
        return this;
    }

    /**
     * Prepend one-time listener to the beginning of listeners array
     * @param {string} event - Event name
     * @param {Function} listener - Event handler function
     */
    prependOnceListener(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.removeListener(event, onceWrapper);
        };
        
        this.prependListener(event, onceWrapper);
        return this;
    }
}

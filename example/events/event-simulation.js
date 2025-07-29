// Event simulation example
import { EventEmitter } from '../../packages/core/src/utils/event-emitter.js';

const logger = (msg) => console.log(`[EventLogger]: ${msg}`);

class ExampleEventSystem extends EventEmitter {
    constructor() {
        super();
    }

    simulateEvent(eventName, data) {
        logger(`Emitting ${eventName} with data: ${JSON.stringify(data)}`);
        this.emit(eventName, data);
    }
}

const eventSystem = new ExampleEventSystem();
eventSystem.on('eventOccurred', (data) => {
    console.log(`Handling event with data: ${data}`);
});

export function runSimulation() {
    eventSystem.simulateEvent('eventOccurred', { id: 1, value: 'SampleData' });
}

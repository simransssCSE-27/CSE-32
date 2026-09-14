const EventEmitter = require('events');

const myEmitter = new EventEmitter();

// Event listener
myEmitter.on('click', (name) => {
    console.log(`Button clicked by ${name}`);
});

// Another event listener
myEmitter.on('submit', (data) => {
    console.log(`Form submitted with data: ${data}`);
});

// Simulating DOM events
myEmitter.emit('click', 'Simran');
myEmitter.emit('submit', 'Student Details');
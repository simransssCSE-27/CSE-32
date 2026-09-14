const EventEmitter = require('events');

class MyClass extends EventEmitter {}
const myEmitter = new MyClass();

myEmitter.on('greet', (name) => {
    console.log(`Welcome, ${name}`);
});

myEmitter.on('exit', (code) => {
    console.log(`Exit event received. Code: ${code}`);
});

myEmitter.emit('greet', 'Simran');
myEmitter.emit('exit', 0);
const EventEmitter = require('events');

const application = new EventEmitter();

application.on('input', (text) => {
    console.log(`Input entered: ${text}`);
});

application.on('buttonClick', () => {
    console.log('Button clicked');
});

application.on('formSubmit', () => {
    console.log('Form submitted successfully');
});

application.on('notification', (msg) => {
    console.log(`Notification: ${msg}`);
});

application.emit('input', 'Hello Node.js');
application.emit('buttonClick');
application.emit('formSubmit');
application.emit('notification', 'Welcome to the application');
const EventEmitter = require('events');

const tracker = new EventEmitter();

tracker.on('login', (name) => {
    console.log(`${name} logged in`);
});

tracker.on('courseRegistration', (course) => {
    console.log(`Course registered: ${course}`);
});

tracker.on('notification', (msg) => {
    console.log(`Notification: ${msg}`);
});

tracker.on('logout', (name) => {
    console.log(`${name} logged out`);
});

tracker.emit('login', 'Rahul');
tracker.emit('courseRegistration', 'Full Stack Development');
tracker.emit('notification', 'Your course registration is successful');
tracker.emit('logout', 'Rahul');
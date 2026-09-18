const EventEmitter = require('events');

const student = new EventEmitter();

student.on('studentJoined', (name) => {
    console.log(`Student ${name} joined the session.`);
});

student.on('courseSelected', (course) => {
    console.log(`Course selected: ${course}`);
});

student.on('sessionEnded', (code) => {
    console.log(`Session ended. Code: ${code}`);
});

student.emit('studentJoined', 'Rahul');
student.emit('courseSelected', 'Full Stack Development');
student.emit('sessionEnded', '0');
const fs = require('fs');

// 1. Create / Write initial data
fs.writeFileSync('student.txt', 'B.Tech Node.js Lab\n');

// 2. Read the current data
const data = fs.readFileSync('student.txt', 'utf8');
console.log("--- Initial Read ---");
console.log(data);

// 3. Overwrite the file with new details
fs.writeFileSync('student.txt', 'Name: Rahul\nSubject: Full Stack Development\n');
console.log('File created successfully\n');

// 4. Update / Append new content to the file
fs.appendFileSync('student.txt', 'Experiment 2 completed.');
console.log('File updated\n');

// 5. Read the final updated file content
const updatedData = fs.readFileSync('student.txt', 'utf8');
console.log("--- Final Read ---");
console.log(updatedData);
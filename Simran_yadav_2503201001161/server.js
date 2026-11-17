
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Initial student records
let students = [
    {
        id: 201,
        rollNumber: "CSE2401",
        name: "Aarav Sharma",
        branch: "CSE",
        semester: 3,
        email: "aarav@example.com"
    },
    {
        id: 202,
        rollNumber: "ECE2402",
        name: "Diya Verma",
        branch: "ECE",
        semester: 3,
        email: "diya@example.com"
    },
    {
        id: 203,
        rollNumber: "CSE2403",
        name: "Kabir Singh",
        branch: "CSE",
        semester: 3,
        email: "kabir@example.com"
    }
];

// Function to validate student data
function validateStudent(data) {
    const { rollNumber, name, branch, semester, email } = data;

    if (
        typeof rollNumber !== "string" || !rollNumber.trim() ||
        typeof name !== "string" || !name.trim() ||
        typeof branch !== "string" || !branch.trim() ||
        !Number.isInteger(semester) || semester < 1 ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return false;
    }

    return true;
}

// 1. GET ALL STUDENTS
app.get("/api/students", (req, res) => {
    res.status(200).json(students);
});

// 2. POST - ADD NEW STUDENT
app.post("/api/students", (req, res) => {

    const data = req.body;

    if (!validateStudent(data)) {
        return res.status(400).json({
            message: "Invalid input. All fields are required."
        });
    }

    // Check duplicate roll number
    const duplicate = students.find(
        student =>
            student.rollNumber.toLowerCase() ===
            data.rollNumber.trim().toLowerCase()
    );

    if (duplicate) {
        return res.status(400).json({
            message: "Roll number already exists."
        });
    }

    // Generate unique ID
    const newId = students.length > 0
        ? Math.max(...students.map(s => s.id)) + 1
        : 1;

    const newStudent = {
        id: newId,
        rollNumber: data.rollNumber.trim(),
        name: data.name.trim(),
        branch: data.branch.trim(),
        semester: data.semester,
        email: data.email.trim()
    };

    students.push(newStudent);

    res.status(201).json(newStudent);
});

// 3. GET STUDENT BY ID
app.get("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    res.status(200).json(student);
});

// 4. PUT - UPDATE STUDENT
app.put("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    const data = req.body;

    if (!validateStudent(data)) {
        return res.status(400).json({
            message: "Invalid input. All fields are required."
        });
    }

    // Check whether another student has the same roll number
    const duplicate = students.find(
        s =>
            s.id !== id &&
            s.rollNumber.toLowerCase() ===
            data.rollNumber.trim().toLowerCase()
    );

    if (duplicate) {
        return res.status(400).json({
            message: "Roll number already exists."
        });
    }

    const updatedStudent = {
        id: id,
        rollNumber: data.rollNumber.trim(),
        name: data.name.trim(),
        branch: data.branch.trim(),
        semester: data.semester,
        email: data.email.trim()
    };

    students[index] = updatedStudent;

    res.status(200).json(updatedStudent);
});

// 5. DELETE STUDENT
app.delete("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found."
        });
    }

    students.splice(index, 1);

    res.status(200).json({
        message: "Student deleted successfully."
    });
});

// 6. FILTER STUDENTS BY BRANCH
// Keep this route before /:id
app.get("/api/students/filter", (req, res) => {

    const branch = req.query.branch;

    if (typeof branch !== "string" || !branch.trim()) {
        return res.status(400).json({
            message: "Please provide a branch."
        });
    }

    const filteredStudents = students.filter(
        s =>
            s.branch.toLowerCase() ===
            branch.trim().toLowerCase()
    );

    res.status(200).json(filteredStudents);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

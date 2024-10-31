// libaries
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); // for handling file paths

// initialies express app and port
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// setup storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // directory to save images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // add timestamp to filename
    }
});

const upload = multer({ storage });

// middleware to parse JSON requests
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve images from the uploads directory

// endpoint to upload files
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ filePath: `http://localhost:${PORT}/uploads/${req.file.filename}` }); // Send the file path
    } else {
        res.status(400).send('File upload failed');
    }
});

// get student data
app.get('/students', (req, res) => {
    fs.readFile('students.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading students.json:', err);
            res.status(500).send('Error reading file');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// get teacher data
app.get('/teachers', (req, res) => {
    fs.readFile('teacher.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading teacher.json:', err);
            res.status(500).send('Error reading file');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// add a new student
app.post('/students', (req, res) => {
    fs.readFile('students.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        const students = JSON.parse(data);

        // Check all required fields
        const { sirName, firstName, year, form, image, username, password } = req.body;
        
        console.log("Received student data:", req.body); // log

        if (!sirName || !firstName || !year || !form || !username || !password) { //| !image |
            return res.status(400).send('Missing required student fields');
        }

        // add the new student data
        students.push(req.body);
        fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.status(201).send('Student added');
        });
    });
});

// update status and reason
app.patch('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id); // get student index from the URL
    fs.readFile('students.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }

        const students = JSON.parse(data);
        // Check if the student exists
        if (students[studentId] !== undefined) {
            // update status and reason
            students[studentId].studentPermissionStatus = req.body.studentPermissionStatus;
            students[studentId].reason = req.body.reason;
            students[studentId].changedBy = req.body.changedBy; // log name of the user making the change
        } else {
            return res.status(404).send('Student not found');
        }

        // save the updated students array back to the JSON file
        fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing file');
                return;
            }
            res.status(200).send('Student permission status updated');
        });
    });
});

// delete a student by ID
app.delete('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id); // get student index from the URL

    fs.readFile('students.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }

        const students = JSON.parse(data);
        
        if (students[studentId] !== undefined) {
            // remove student from array
            students.splice(studentId, 1);
        } else {
            return res.status(404).send('Student not found');
        }

        // save the updated students array back to the JSON file
        fs.writeFile('students.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing file');
                return;
            }
            res.status(200).send('Student deleted successfully');
        });
    });
});

// start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
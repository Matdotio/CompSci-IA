// wait for the DOM
document.addEventListener('DOMContentLoaded', () => {
    // event listener
    document.getElementById('loginForm').addEventListener('submit', authenticateUser);
});

// function to authenticate user
async function authenticateUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // fetch teacher data
        console.log('Fetching user data from: http://localhost:3000/teachers');
        const teacherResponse = await fetch('http://localhost:3000/teachers');

        if (!teacherResponse.ok) {
            throw new Error('Network response was not ok for teachers');
        }

        const teachers = await teacherResponse.json();
        console.log('Fetched teachers:', teachers); // log

        // check teacher credentials
        const teacher = teachers.find(t => t.username === username && t.password === password);
        console.log('Checking teacher credentials:', username, password, teacher); // log

        if (teacher) {
            console.log('Teacher authenticated:', teacher); // log
            window.location.href = 'teacher.html'; // redirect
            return;
        } else {
            console.log('Teacher authentication failed'); // lgo
        }

        // fetch student data if teacher not found
        console.log('Fetching user data from: http://localhost:3000/students');
        const studentResponse = await fetch('http://localhost:3000/students');

        if (!studentResponse.ok) {
            throw new Error('Network response was not ok for students');
        }

        const students = await studentResponse.json();
        const student = students.find(s => s.username === username && s.password === password);
        console.log('Checking student credentials:', username, password, student); // log

        if (student) {
            console.log('Redirecting to student.html');
            localStorage.setItem('currentStudent', JSON.stringify(student));
            window.location.href = 'student.html'; // redirect
        } else {
            // shows error message
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.innerText = 'Invalid username or password';
                errorMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.innerText = 'Error fetching user data: ' + error.message;
            errorMessage.style.display = 'block';
        }
    }
}
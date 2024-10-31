document.addEventListener('DOMContentLoaded', () => {
    const updateStatusUI = (currentStudent) => {
        const statusDiv = document.getElementById('studentStatus');
        const currentTime = new Date().toLocaleTimeString();
        const currentDate = new Date().toLocaleDateString();

        // clear and update
        statusDiv.innerHTML = '';

        // check status
        if (currentStudent.studentPermissionStatus === true) {
            // permission denied
            statusDiv.innerHTML = `
                <div class="status-container">
                    <div class="status red">
                        <span class="status-icon">&#10006;</span> <!-- "X" icon -->
                    </div>
                    <div class="info">
                        <p>${currentTime}</p>
                        <p>${currentDate}</p>
                        <p>${currentStudent.sirName}</p>
                        <p>${currentStudent.firstName}</p>
                        <p>${currentStudent.reason}</p>
                        <p>${currentStudent.changedBy}</p>
                    </div>
                </div>
            `;
        } else {
            // permission granted
            statusDiv.innerHTML = `
                <div class="status-container">
                    <div class="status green">
                        <span class="status-icon">&#10003;</span> <!-- Checkmark icon -->
                    </div>
                    <div class="info">
                        <p>${currentTime}</p>
                        <p>${currentDate}</p>
                        <p>${currentStudent.sirName}</p>
                        <p>${currentStudent.firstName}</p>
                    </div>
                </div>
            `;
        }
    };

    const fetchStudentData = async () => {
        // fetch fetch student date
        const response = await fetch('http://localhost:3000/students');
        const students = await response.json();
        const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));

        // find the student with the matching username or id
        const updatedStudent = students.find(s => s.username === currentStudent.username);

        // update the localStorage
        if (updatedStudent) {
            localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
        }

        return updatedStudent;
    };

    const checkPermissionStatus = async () => {
        const currentStudent = await fetchStudentData(); // fetch data

        if (currentStudent) {
            updateStatusUI(currentStudent); // update the UI
        } else {
            // redirect to login
            window.location.href = 'login.html';
        }
    };

    checkPermissionStatus();

    // update every 5 seconed
    setInterval(checkPermissionStatus, 5000);
});
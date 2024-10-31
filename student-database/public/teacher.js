let cellCount = 0;
let rowCount = 0;
let studentsData = []; // store all students

// status indicator
function showStatusIndicator(message, isError = false) {
    const indicator = document.getElementById('statusIndicator');
    indicator.innerText = message;
    indicator.style.backgroundColor = isError ? 'red' : 'green';
    indicator.style.display = 'block';
}

// create a new cell with a unique ID and a sub-table
function createNewCell(student) {
    // new row after 3 cels
    if (cellCount % 3 === 0) {
        rowCount++;
        const newRow = document.createElement('tr');
        newRow.id = `row${rowCount}`;
        document.getElementById('dynamicTable').querySelector('tbody').appendChild(newRow); // Append to tbody
    }

    const newCell = document.createElement('td');
    const cellId = `cell_${cellCount}`;
    newCell.id = cellId;

    // set background color based on permission status
    const backgroundColor = student.studentPermissionStatus ? '#E27F7F' : '#49EA62';

    const subTable = `
    <table id="table-${cellId}" class="sub-table-green" style="background-color: ${backgroundColor};">
        <tr>
            <td class="align-center">
                <div class="image-container">
                    <img src="${student.image}" alt="Picture of ${student.firstName} ${student.sirName}">
                </div>
            </td>
            <td>
                <table>
                    <tr><td>Sir-Name:</td><td>${student.sirName}</td></tr>
                    <tr><td>Name:</td><td>${student.firstName}</td></tr>
                    <tr><td>Year:</td><td>${student.year}</td></tr>
                    <tr><td>Form:</td><td>${student.form}</td></tr>
                    
                    <tr>
                        <td colspan="2">
                            <label class="switch">
                                <input id="switch-${cellId}" type="checkbox" 
                                    onclick="changePermission('${cellId}')" 
                                    ${student.studentPermissionStatus ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <select id="reason-${cellId}" style="display: ${student.studentPermissionStatus ? 'block' : 'none'};">
                                <option value="0">Select Reason:</option>
                                <option value="1" ${student.reason === "1" ? "selected" : ""}>Late</option>
                                <option value="2" ${student.reason === "2" ? "selected" : ""}>CAS</option>
                                <option value="3" ${student.reason === "3" ? "selected" : ""}>Uniform</option>
                                <option value="4" ${student.reason === "4" ? "selected" : ""}>Behavior</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <button class="deleteBtn" onclick="deleteStudent(${cellCount})"></button>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    `;

    newCell.innerHTML = subTable;
    document.getElementById(`row${rowCount}`).appendChild(newCell); // add the new cell to the current row
    cellCount++;
}

// change cell coulorr based on statues
function changePermission(cellId) {
    const toggle = document.getElementById(`switch-${cellId}`);
    const table = document.getElementById(`table-${cellId}`);
    const dropdown = document.getElementById(`reason-${cellId}`);
    
    // update status based on toggle
    const isChecked = toggle.checked;
    table.style.backgroundColor = isChecked ? '#49EA62' : '#E27F7F';

    dropdown.style.display = isChecked ? 'block' : 'none';

    const reason = dropdown.value;

    // update status in JSON
    const studentIndex = cellId.split('_')[1];
    updateStudentPermissionStatus(studentIndex, isChecked, reason);
}

// update status, reason, username in JSON
async function updateStudentPermissionStatus(studentIndex, permissionStatus, reason) {
    const userName = 'username';

    try {
        const response = await fetch(`http://localhost:3000/students/${studentIndex}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                studentPermissionStatus: permissionStatus,
                reason: reason, // Save reason
                changedBy: userName // Save usernaem
            })
        });

        if (!response.ok) throw new Error('Failed to update student permission status');
        console.log(`Student ${studentIndex} updated: ${JSON.stringify({ studentPermissionStatus: permissionStatus, reason: reason })}`);
    } catch (error) {
        console.error('Error updating student permission status:', error);
    }
}

// fetch student data from JSON file
async function fetchStudentData() {
    try {
        const response = await fetch('http://localhost:3000/students');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const students = await response.json();
        studentsData = students; // store data for search functionality
        displayStudents(students); // display students
        showStatusIndicator('Connected to Database');
    } catch (error) {
        console.error('Error fetching student data:', error);
        showStatusIndicator('Failed to connect to Database', true);
    }
}

// display students
function displayStudents(students) {
    // reset the table
    const dynamicTable = document.getElementById('dynamicTable');
    dynamicTable.querySelector('tbody').innerHTML = ''; // clear previous content
    cellCount = 0;
    rowCount = 0;

    if (students.length === 0) {
        const noResultsCell = document.createElement('td');
        noResultsCell.colSpan = 3;
        noResultsCell.textContent = 'No results found';
        const noResultsRow = document.createElement('tr');
        noResultsRow.appendChild(noResultsCell);
        dynamicTable.querySelector('tbody').appendChild(noResultsRow);
        return;
    }

    students.forEach(student => createNewCell(student));
}

// search functionallity
document.getElementById('searchInput').addEventListener('input', function(event) {
    const searchQuery = event.target.value.toLowerCase(); // convert to lowercase
    const filteredStudents = studentsData.filter(student => {
        const fullName = `${student.firstName.toLowerCase()} ${student.sirName.toLowerCase()}`;
        return fullName.includes(searchQuery);
    });

    displayStudents(filteredStudents);
});

// show studnet form
document.getElementById('addStudentBtn').addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'flex';
});

// hide student form
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'none';
});

// generate username from sir- and firstname
function generateUsername(firstName, sirName) {
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${firstName.toLowerCase()}.${sirName.toLowerCase()}${randomNumber}`; // format: firstname.surnameXXX
}

// generate a random password
function generatePassword() {
    const randomString = Math.random().toString(36).substring(2, 10); // Generate random string
    return randomString;
}

// save data from from
document.getElementById('saveStudentBtn').addEventListener('click', async () => {
    const sirName = document.getElementById('sirName').value;
    const firstName = document.getElementById('firstName').value;
    
    const newStudent = {
        sirName: sirName,
        firstName: firstName,
        year: document.getElementById('year').value,
        form: document.getElementById('form').value,
        image: document.getElementById('image').value,
        studentPermissionStatus: false,
        reason: null,
        username: generateUsername(firstName, sirName),
        password: generatePassword()
    };

    console.log("New student data:", newStudent); // log

    // send a POST request to save the new student
    try {
        const response = await fetch('http://localhost:3000/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStudent)
        });

        if (response.ok) {
            studentsData.push(newStudent); // add new student to data
            displayStudents(studentsData); // redisplay student list
            document.getElementById('overlay').style.display = 'none'; // hide from
            // Clear input fields after saving
            document.getElementById('sirName').value = '';
            document.getElementById('firstName').value = '';
            document.getElementById('year').value = '';
            document.getElementById('form').value = '';
            document.getElementById('image').value = '';
            showStatusIndicator('Student saved successfully');
        } else {
            const errorMessage = await response.text(); // get the error message from the server
            console.error('Failed to save student data:', errorMessage);
            showStatusIndicator('Failed to save student data: ' + errorMessage, true);
        }
    } catch (error) {
        console.error('Error saving student data:', error);
        showStatusIndicator('Error saving student data', true);
    }
});

// event listener to the dropdown
document.addEventListener('change', function(event) {
    if (event.target.matches('select[id^="reason-"]')) {
        const cellId = event.target.id.split('-')[1]; // get the cell ID
        const toggle = document.getElementById(`switch-${cellId}`);
        const isChecked = toggle.checked;

        // get reason
        const reason = event.target.value;

        // Update status in JSON
        const studentIndex = cellId.split('_')[1];
        updateStudentPermissionStatus(studentIndex, isChecked, reason);
    }
});

// delete student infromation
async function deleteStudent(cellCount) {
    const confirmed = confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    const studentIndex = cellCount; // use cellCount to get student index

    try {
        // send DELETE request to server
        const response = await fetch(`http://localhost:3000/students/${studentIndex}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // remove student from local data array
            studentsData = studentsData.filter((_, index) => index !== studentIndex);

            // redisplay student list
            displayStudents(studentsData);

            showStatusIndicator('Student deleted successfully');
        } else {
            console.error('Failed to delete student');
            showStatusIndicator('Failed to delete student', true);
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showStatusIndicator('Error deleting student', true);
    }
}

// sort students by attribute
function sortStudents(attribute) {
    const sortedStudents = [...studentsData].sort((a, b) => {
        if (attribute === 'studentPermissionStatus') {
            return (a.studentPermissionStatus === b.studentPermissionStatus) ? 0 :
                   (a.studentPermissionStatus ? -1 : 1); // true before false
        } else {
            if (a[attribute] < b[attribute]) return -1;
            if (a[attribute] > b[attribute]) return 1;
            return 0;
        }
    });
    return sortedStudents;
}

// event listener for sort button
document.getElementById('sortBtn').addEventListener('click', () => {
    const selectedAttribute = document.getElementById('sortSelect').value;
    const sortedStudents = sortStudents(selectedAttribute);
    displayStudents(sortedStudents);
});

// fetch and populate student data on load
fetchStudentData();
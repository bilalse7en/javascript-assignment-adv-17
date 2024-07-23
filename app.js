document.addEventListener("DOMContentLoaded", () => {
    const fileDropZone = document.getElementById("file-drop-zone");
    const fileInput = document.getElementById("file-input");
    const tableBody = document.querySelector("#attendanceTable tbody");
    const tableFilter = document.getElementById("table-filter");
    const addStudentModal = new bootstrap.Modal(document.getElementById('addStudentModal'));
    const editStudentModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
    const loginButton = document.getElementById('loginButton');
    const navbar = document.getElementById('navbar');

    const rowsPerPage = 10;
    let currentPage = 1;
    let studentData = [];
    let currentEditIndex = -1;

    const displayTable = (data) => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        paginatedData.forEach((rowData, rowIndex) => {
            const tr = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                tr.appendChild(td);
            });
        
            const actionCell = document.createElement('td');
            actionCell.classList.add('text-center')
            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'edit-btn', 'px-1', 'py-0');
            editBtn.innerHTML = '<i class="fa fa-pencil fa-sm"></i>';
            editBtn.addEventListener('click', () => openEditModal(rowIndex));
            actionCell.appendChild(editBtn);
        
            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'delete-btn', 'ms-2', 'px-1', 'py-0');
            deleteBtn.innerHTML = '<i class="fa fa-trash fa-sm"></i>';
            deleteBtn.addEventListener('click', () => deleteStudent(rowIndex));
            actionCell.appendChild(deleteBtn);
        
            tr.appendChild(actionCell);
            tableBody.appendChild(tr);
        });

        setupPagination(data);
    };

    const setupPagination = (data) => {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        const pageCount = Math.ceil(data.length / rowsPerPage);

        const createPaginationItem = (text, clickHandler) => {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            pageItem.innerHTML = `<a class="page-link" href="#">${text}</a>`;
            pageItem.addEventListener('click', (event) => {
                event.preventDefault();
                clickHandler();
            });
            pagination.appendChild(pageItem);
        };

        createPaginationItem('<<', () => {
            currentPage = 1;
            displayTable(data);
            updatePagination();
        });

        createPaginationItem('<', () => {
            if (currentPage > 1) {
                currentPage--;
                displayTable(data);
                updatePagination();

            }
        });

        for (let i = 1; i <= pageCount; i++) {
            createPaginationItem(i, () => {
                currentPage = i;
                displayTable(data);
                updatePagination();
            });
        }

        createPaginationItem('>', () => {
            if (currentPage < pageCount) {
                currentPage++;
                displayTable(data);
                updatePagination();
            }
        });

        createPaginationItem('>>', () => {
            currentPage = pageCount;
            displayTable(data);
            updatePagination();
        });
    };

    const updatePagination = () => {
        const paginationItems = document.querySelectorAll('#pagination .page-item');
        paginationItems.forEach((item, index) => {
            if (index === currentPage + 1) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    const handleFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const newStudentData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            newStudentData.shift();

            studentData = [...studentData, ...newStudentData];
            saveData();
            currentPage = 1;
            displayTable(studentData);
        };
        reader.readAsArrayBuffer(file);
    };

    const saveData = () => {
        localStorage.setItem('attendanceData', JSON.stringify(studentData));
    };

    const loadData = () => {
        const storedData = localStorage.getItem('attendanceData');
        if (storedData) {
            studentData = JSON.parse(storedData);
            displayTable(studentData);
        }
    };

    const addStudentToTable = (student) => {
        studentData.push(student);
        saveData();
        displayTable(studentData);
    };

    const applyFilters = () => {
        const searchTerm = tableFilter.value.toLowerCase();
        const filteredData = studentData.filter(row =>
            row.some(cell => cell.toString().toLowerCase().includes(searchTerm))
        );
        displayTable(filteredData);
    };

    const openEditModal = (rowIndex) => {
        currentEditIndex = rowIndex;
        const student = studentData[rowIndex];
        const editForm = document.getElementById('editStudentForm');
        editForm.elements['firstname'].value = student[0];
        editForm.elements['lastname'].value = student[1];
        editForm.elements['email'].value = student[2];
        editForm.elements['rollnumber'].value = student[3];
        editForm.elements['batchnumber'].value = student[4];
        editForm.elements['timing'].value = student[5];
        editForm.elements['days'].value = student[6];
        editForm.elements['teachername'].value = student[7];
        editStudentModal.show();
    };

    const saveStudent = () => {
        const editForm = document.getElementById('editStudentForm');
        const updatedStudent = [
            editForm.elements['firstname'].value,
            editForm.elements['lastname'].value,
            editForm.elements['email'].value,
            editForm.elements['rollnumber'].value,
            editForm.elements['batchnumber'].value,
            editForm.elements['timing'].value,
            editForm.elements['days'].value,
            editForm.elements['teachername'].value
        ];

        studentData[currentEditIndex] = updatedStudent;
        saveData();
        displayTable(studentData);
        editStudentModal.hide();
    };

    const deleteStudent = (rowIndex) => {
        studentData.splice(rowIndex, 1);
        saveData();
        displayTable(studentData);
    };
    document.getElementById('saveEditStudentBtn').addEventListener('click', saveStudent);
    fileDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileDropZone.classList.add("drag-over");
    });

    fileDropZone.addEventListener("dragleave", () => {
        fileDropZone.classList.remove("drag-over");
    });

    fileDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        fileDropZone.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel")) {
            handleFile(file);
    
        } else {
            alert("Please drop a valid Excel file.");
        }
    });

    fileDropZone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel")) {
            handleFile(file);
    
        } else {
            alert("Please select a valid Excel file.");
        }
    });

    tableFilter.addEventListener("input", applyFilters);

    const attendanceForm = document.getElementById('attendanceForm');
    attendanceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(attendanceForm);
        const newStudent = Array.from(formData.values()).map(value => value.trim());
        if (newStudent.some(value => !value)) {
            alert("Please fill out all fields.");
            return;
        }
        addStudentToTable(newStudent);
        attendanceForm.reset();
        addStudentModal.hide();
    });

    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (isLoggedIn) {
        loginButton.textContent = 'Sign Out';
        loginButton.addEventListener('click', () => {
            localStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
    } else {
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    });


    const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');

    confirmDeleteAllBtn.addEventListener('click', () => {
        // Clear table body
        document.querySelector("#attendanceTable tbody").innerHTML = '';

        // Clear local storage
        localStorage.removeItem('attendanceData');
        location.reload();

        // Hide the modal using jQuery
        $('#deleteConfirmModal').modal('hide'); // Ensure jQuery is working correctly here
        
    });
    
    

    loadData();
});
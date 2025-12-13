// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', async () => {
    // Function to fetch data and populate a table
    const fetchAndPopulateTable = async (apiUrl, tableId, columnsToDisplay, excludeColumns = [], enableActions = false, idColumnName = '') => {
        const tableBody = document.querySelector(`#${tableId}`); // Directly target the tbody by its ID
        if (!tableBody) {
            console.warn(`[${tableId}] Table body with ID ${tableId} not found. Skipping population.`);
            return;
        }
        console.log(`[${tableId}] Found table body with ID ${tableId}. Attempting to populate from ${apiUrl}.`);

        tableBody.innerHTML = '<tr><td colspan="100%">Loading...</td></tr>'; // Loading indicator

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 401) {
                    tableBody.innerHTML = '<tr><td colspan="100%">Unauthorized. Please log in as an Admin or Manager.</td></tr>';
                    console.error(`[${tableId}] Unauthorized access to ${apiUrl}.`);
                    // Optionally redirect to login
                    // window.location.href = '/login-signup.html';
                } else {
                    const errorText = await response.text(); // Get raw error response
                    throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
                }
            }
            const data = await response.json(); // Expecting List<Dictionary<string, object>>
            console.log(`[${tableId}] Data received from ${apiUrl}:`, data);

            tableBody.innerHTML = ''; // Clear loading indicator

            // Add action column to headers if actions are enabled
            let headers = [...columnsToDisplay];
            if (enableActions) {
                headers.push('Actions');
            }

            if (data.length > 0) {
                data.forEach((row, index) => {
                    const tr = document.createElement('tr');
                    const th = document.createElement('th');
                    th.setAttribute('scope', 'row');
                    th.textContent = index + 1;
                    tr.appendChild(th);

                    columnsToDisplay.forEach(colName => {
                        if (!excludeColumns.includes(colName)) {
                            const td = document.createElement('td');
                            let cellValue = row[colName];
                            // Handle password masking if it slipped through
                            if (colName.toLowerCase().includes('password')) {
                                cellValue = '********';
                            }
                            td.textContent = cellValue;
                            tr.appendChild(td);
                        }
                    });

                    // Add action buttons
                    if (enableActions && idColumnName) {
                        const tdActions = document.createElement('td');
                        const entityId = row[idColumnName]; // Get the ID for the current row

                        const editButton = document.createElement('button');
                        editButton.className = 'btn btn-sm btn-primary me-2';
                        editButton.textContent = 'Edit';
                        editButton.addEventListener('click', () => {
                            let redirectPage = '';
                            if (tableId === 'staffTable') redirectPage = 'UpdateStaff.html';
                            else if (tableId === 'roomTable') redirectPage = 'UpdateRoom.html';
                            else if (tableId === 'serviceTable') redirectPage = 'UpdateService.html';
                            
                            if (redirectPage) {
                                window.location.href = `/${redirectPage}?id=${entityId}`;
                            } else {
                                console.warn(`No update page defined for table ${tableId}`);
                            }
                        });
                        tdActions.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.className = 'btn btn-sm btn-danger';
                        deleteButton.textContent = 'Delete';
                        deleteButton.addEventListener('click', async () => {
                            if (confirm(`Are you sure you want to delete ${tableId.replace('Table', '')} with ID: ${entityId}?`)) {
                                let deleteApiUrl = '';
                                if (tableId === 'staffTable') deleteApiUrl = `/api/admin/deletestaff/${entityId}`;
                                else if (tableId === 'roomTable') deleteApiUrl = `/api/admin/deleteroom/${entityId}`;
                                else if (tableId === 'serviceTable') deleteApiUrl = `/api/admin/deleteservice/${entityId}`;

                                if (deleteApiUrl) {
                                    try {
                                        const deleteResponse = await fetch(deleteApiUrl, {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        });

                                        if (deleteResponse.ok) {
                                            alert(`${tableId.replace('Table', '')} deleted successfully!`);
                                            fetchAndPopulateTable(apiUrl, tableId, columnsToDisplay, excludeColumns, enableActions, idColumnName); // Refresh table
                                        } else {
                                            const errorData = await deleteResponse.json();
                                            alert(`Failed to delete ${tableId.replace('Table', '')}: ${errorData.message}`);
                                        }
                                    } catch (deleteError) {
                                        console.error(`Error deleting ${tableId.replace('Table', '')}:`, deleteError);
                                        alert('An unexpected error occurred during deletion.');
                                    }
                                } else {
                                    console.warn(`No delete API defined for table ${tableId}`);
                                }
                            }
                        });
                        tdActions.appendChild(deleteButton);
                        tr.appendChild(tdActions);
                    }
                    tableBody.appendChild(tr);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="100%">No data available.</td></tr>`;
                console.log(`[${tableId}] No data available for ${apiUrl}.`);
            }
        } catch (error) {
            console.error(`[${tableId}] Error fetching data for ${tableId}:`, error);
            tableBody.innerHTML = `<tr><td colspan="100%" class="text-danger">Failed to load data: ${error.message}</td></tr>`;
        }
    };

    // Populate Admin Table
    if (document.querySelector('#adminTable')) {
        fetchAndPopulateTable(
            '/api/admin/admins',
            'adminTable',
            ['UserName', 'SystemAdministration', 'CreateOtherAdminUser', 'CreateStaff'], // Explicitly list columns for order
            ['Password'], // Explicitly exclude password column from display
            true, // Enable actions
            'UserName' // ID column name for Admin (used for delete and update)
        );
    }

    // Populate Manager Table
    if (document.querySelector('#managerTable')) {
        fetchAndPopulateTable(
            '/api/admin/managers',
            'managerTable',
            ['UserName', 'ManagerName'],
            ['Password']
        );
    }

    // Populate Staff Table
    if (document.querySelector('#staffTable')) {
        fetchAndPopulateTable(
            '/api/admin/staff',
            'staffTable',
            ['StaffEmployeeID', 'SUsername', 'Name', 'Role', 'ManagerUserName', 'AdminUserName'],
            ['Password'],
            true, // Enable actions
            'SUsername' // ID column name for Staff (used for delete)
        );
    }

    // Populate Guest Table
    if (document.querySelector('#guestTable')) {
        fetchAndPopulateTable(
            '/api/admin/guests',
            'guestTable',
            ['UserName', 'Name', 'UserInformation'],
            ['Password']
        );
    }

    // Populate Room Type Table
    if (document.querySelector('#roomTypeTable')) {
        fetchAndPopulateTable(
            '/api/admin/roomtypes',
            'roomTypeTable',
            ['RoomTypeID', 'CategoryName', 'Price', 'bed', 'bath'],
            [], // No columns to exclude
            true, // Enable actions
            'RoomTypeID' // ID column name for RoomType
        );
    }

    // Populate Room Table
    if (document.querySelector('#roomTable')) {
        fetchAndPopulateTable(
            '/api/admin/rooms',
            'roomTable',
            ['RoomNumber', 'CategoryName', 'PricePerNight'],
            [], // No columns to exclude
            true, // Enable actions
            'RoomNumber' // ID column name for Room
        );
    }

    // Populate Reservation Table
    if (document.querySelector('#reservationTable')) {
        fetchAndPopulateTable(
            '/api/admin/reservations',
            'reservationTable',
            ['ReservationID', 'RoomNumber', 'UserName', 'CheckInDate', 'CheckOutDate']
        );
    }
    
    // Populate Room Manager Table - assuming it has CategoryName and ManagerUserName as columns
    if (document.querySelector('#roomManagerTable')) {
        fetchAndPopulateTable(
            '/api/admin/roommanagers',
            'roomManagerTable',
            ['CategoryName', 'ManagerUserName']
        );
    }


    // Populate Service Table
    if (document.querySelector('#serviceTable')) {
        fetchAndPopulateTable(
            '/api/admin/services',
            'serviceTable',
            ['ServiceID', 'AmenityName', 'Description', 'Availability', 'AdditionalCharges'],
            [], // No columns to exclude
            true, // Enable actions
            'ServiceID' // ID column name for Service
        );
    }

    // Populate Feedback Table
    if (document.querySelector('#feedbackTable')) {
        fetchAndPopulateTable(
            '/api/admin/feedback',
            'feedbackTable',
            ['UserName', 'FeedbackDate', 'Comments', 'Rating']
        );
    }
});


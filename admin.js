// Admin Panel JavaScript

// Sample data storage (in production, this would be in a database)
let adminData = {
  credentials: {
    username: "admin",
    password: "admin123",
  },
  donors: JSON.parse(localStorage.getItem("donors")) || [],
  appointments: JSON.parse(localStorage.getItem("appointments")) || [],
  inventory: JSON.parse(localStorage.getItem("inventory")) || {
    "A+": 45,
    "A-": 12,
    "B+": 38,
    "B-": 8,
    "AB+": 15,
    "AB-": 5,
    "O+": 52,
    "O-": 10,
  },
  requests: JSON.parse(localStorage.getItem("requests")) || [],
  enquiries: JSON.parse(localStorage.getItem("enquiries")) || [],
};

// Save data to localStorage
function saveData() {
  localStorage.setItem("donors", JSON.stringify(adminData.donors));
  localStorage.setItem("appointments", JSON.stringify(adminData.appointments));
  localStorage.setItem("inventory", JSON.stringify(adminData.inventory));
  localStorage.setItem("requests", JSON.stringify(adminData.requests));
  localStorage.setItem("enquiries", JSON.stringify(adminData.enquiries));
}

// Admin Login
function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  if (
    username === adminData.credentials.username &&
    password === adminData.credentials.password
  ) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminDashboard").style.display = "flex";
    document.getElementById("adminName").textContent = username;
    initializeDashboard();
  } else {
    alert("Invalid credentials! Please try again.");
  }
}

// Logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("adminDashboard").style.display = "none";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
  }
}

// Show Section
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Remove active class from all nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show selected section
  const section = document.getElementById(sectionName + "Section");
  if (section) {
    section.classList.add("active");
  }

  // Update header title
  const titles = {
    dashboard: "Dashboard",
    donors: "Donor Management",
    appointments: "Appointments",
    inventory: "Blood Inventory",
    requests: "Blood Requests",
    enquiries: "Enquiry Management",
    zones: "Zone Management",
  };
  document.getElementById("sectionTitle").textContent =
    titles[sectionName] || sectionName;

  // Add active class to clicked nav item
  event.target.closest(".nav-item").classList.add("active");

  // Refresh section data
  if (sectionName === "dashboard") {
    updateDashboardStats();
  } else if (sectionName === "donors") {
    renderDonorsTable();
  } else if (sectionName === "appointments") {
    renderAppointmentsTable();
  } else if (sectionName === "inventory") {
    updateInventoryDisplay();
  } else if (sectionName === "requests") {
    renderRequestsTable();
  } else if (sectionName === "enquiries") {
    // Reload enquiries from localStorage before rendering
    adminData.enquiries = JSON.parse(localStorage.getItem("enquiries")) || [];
    renderEnquiriesTable();
  } else if (sectionName === "zones") {
    updateZoneStats();
  }
}

// Initialize Dashboard
function initializeDashboard() {
  // Reload all data from localStorage
  adminData.enquiries = JSON.parse(localStorage.getItem("enquiries")) || [];
  updateDashboardStats();
  updateInventoryDisplay();
  renderDonorsTable();
  renderAppointmentsTable();
  renderRequestsTable();
  updateZoneStats();
}

// Update Dashboard Stats
function updateDashboardStats() {
  document.getElementById("totalDonors").textContent = adminData.donors.length;
  document.getElementById("totalAppointments").textContent =
    adminData.appointments.length;

  const totalUnits = Object.values(adminData.inventory).reduce(
    (sum, val) => sum + val,
    0
  );
  document.getElementById("totalBloodUnits").textContent = totalUnits;

  const pendingRequests = adminData.requests.filter(
    (r) => r.status === "pending"
  ).length;
  document.getElementById("totalRequests").textContent = pendingRequests;

  // Update recent donors table
  renderRecentDonors();

  // Update blood type chart
  renderBloodTypeChart();
}

// Render Recent Donors
function renderRecentDonors() {
  const tbody = document.getElementById("recentDonorsTable");
  const recentDonors = adminData.donors.slice(-5).reverse();

  if (recentDonors.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="no-data">No recent donors</td></tr>';
    return;
  }

  tbody.innerHTML = recentDonors
    .map(
      (donor) => `
        <tr>
            <td>${donor.fullname}</td>
            <td>${donor.bloodgroup}</td>
            <td>Zone ${donor.zone}</td>
            <td>${donor.registeredDate || "N/A"}</td>
        </tr>
    `
    )
    .join("");
}

// Render Blood Type Chart
function renderBloodTypeChart() {
  const chartDiv = document.getElementById("bloodTypeChart");
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const bloodTypeCounts = {};
  bloodTypes.forEach((type) => {
    bloodTypeCounts[type] = adminData.donors.filter(
      (d) => d.bloodgroup === type
    ).length;
  });

  chartDiv.innerHTML = bloodTypes
    .map(
      (type) => `
        <div class="blood-type-item">
            <div class="type">${type}</div>
            <div class="count">${bloodTypeCounts[type]} donors</div>
        </div>
    `
    )
    .join("");
}

// Render Donors Table
function renderDonorsTable() {
  const tbody = document.getElementById("donorsTableBody");

  if (adminData.donors.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">No donors found</td></tr>';
    return;
  }

  tbody.innerHTML = adminData.donors
    .map(
      (donor, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${donor.fullname}</td>
            <td>${donor.age}</td>
            <td>${donor.gender}</td>
            <td>${donor.bloodgroup}</td>
            <td>${donor.rh}</td>
            <td>Zone ${donor.zone}</td>
            <td>${donor.phone}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewDonor(${index})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="editDonor(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteDonor(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Filter Donors
function filterDonors(searchTerm) {
  const tbody = document.getElementById("donorsTableBody");
  const filteredDonors = adminData.donors.filter(
    (donor) =>
      donor.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.bloodgroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm)
  );

  if (filteredDonors.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">No matching donors found</td></tr>';
    return;
  }

  tbody.innerHTML = filteredDonors
    .map((donor, index) => {
      const originalIndex = adminData.donors.indexOf(donor);
      return `
            <tr>
                <td>${originalIndex + 1}</td>
                <td>${donor.fullname}</td>
                <td>${donor.age}</td>
                <td>${donor.gender}</td>
                <td>${donor.bloodgroup}</td>
                <td>${donor.rh}</td>
                <td>Zone ${donor.zone}</td>
                <td>${donor.phone}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewDonor(${originalIndex})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editDonor(${originalIndex})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteDonor(${originalIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

// Donor Actions
function viewDonor(index) {
  const donor = adminData.donors[index];
  alert(
    `Donor Details:\n\nName: ${donor.fullname}\nAge: ${donor.age}\nGender: ${donor.gender}\nBlood Group: ${donor.bloodgroup}\nRh: ${donor.rh}\nZone: ${donor.zone}\nPhone: ${donor.phone}\nEmail: ${donor.email}\nAddress: ${donor.address}`
  );
}

function editDonor(index) {
  alert("Edit functionality will be implemented with a modal form.");
}

function deleteDonor(index) {
  if (confirm("Are you sure you want to delete this donor?")) {
    adminData.donors.splice(index, 1);
    saveData();
    renderDonorsTable();
    updateDashboardStats();
  }
}

function showAddDonorModal() {
  alert(
    "Add donor modal will be implemented. For now, donors are added through the main website form."
  );
}

// Render Appointments Table
function renderAppointmentsTable() {
  const tbody = document.getElementById("appointmentsTableBody");

  if (adminData.appointments.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="no-data">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = adminData.appointments
    .map(
      (apt, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${apt.donorName}</td>
            <td>${apt.date}</td>
            <td>${apt.time}</td>
            <td>Zone ${apt.zone}</td>
            <td><span class="status-badge status-${apt.status}">${
        apt.status
      }</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="updateAppointmentStatus(${index})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteAppointment(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Filter Appointments
function filterAppointments(status) {
  const tbody = document.getElementById("appointmentsTableBody");
  const filteredApts =
    status === "all"
      ? adminData.appointments
      : adminData.appointments.filter((apt) => apt.status === status);

  if (filteredApts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="no-data">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = filteredApts
    .map((apt, index) => {
      const originalIndex = adminData.appointments.indexOf(apt);
      return `
            <tr>
                <td>${originalIndex + 1}</td>
                <td>${apt.donorName}</td>
                <td>${apt.date}</td>
                <td>${apt.time}</td>
                <td>Zone ${apt.zone}</td>
                <td><span class="status-badge status-${apt.status}">${
        apt.status
      }</span></td>
                <td>
                    <button class="btn-action btn-edit" onclick="updateAppointmentStatus(${originalIndex})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteAppointment(${originalIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function updateAppointmentStatus(index) {
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  const currentStatus = adminData.appointments[index].status;
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  adminData.appointments[index].status = nextStatus;
  saveData();
  renderAppointmentsTable();
  updateDashboardStats();
}

function deleteAppointment(index) {
  if (confirm("Are you sure you want to delete this appointment?")) {
    adminData.appointments.splice(index, 1);
    saveData();
    renderAppointmentsTable();
    updateDashboardStats();
  }
}

function showAddAppointmentModal() {
  alert("Add appointment modal will be implemented.");
}

// Update Inventory
function updateInventoryDisplay() {
  const idMap = {
    "A+": "unitsAP",
    "A-": "unitsAN",
    "B+": "unitsBP",
    "B-": "unitsBN",
    "AB+": "unitsABP",
    "AB-": "unitsABN",
    "O+": "unitsOP",
    "O-": "unitsON",
  };

  Object.keys(adminData.inventory).forEach((type) => {
    const element = document.getElementById(idMap[type]);
    if (element) {
      element.textContent = adminData.inventory[type] + " Units";
    }
  });
}

function updateInventory(bloodType, change) {
  adminData.inventory[bloodType] = Math.max(
    0,
    adminData.inventory[bloodType] + change
  );
  saveData();
  updateInventoryDisplay();
  updateDashboardStats();
}

// Render Requests Table
function renderRequestsTable() {
  const tbody = document.getElementById("requestsTableBody");

  if (adminData.requests.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="no-data">No requests found</td></tr>';
    return;
  }

  tbody.innerHTML = adminData.requests
    .map(
      (req, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${req.patientName}</td>
            <td>${req.bloodType}</td>
            <td>${req.units}</td>
            <td>${req.hospital}</td>
            <td><span class="status-badge status-${req.urgency}">${
        req.urgency
      }</span></td>
            <td><span class="status-badge status-${req.status}">${
        req.status
      }</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="updateRequestStatus(${index})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteRequest(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

function updateRequestStatus(index) {
  const statuses = ["pending", "approved", "completed"];
  const currentStatus = adminData.requests[index].status;
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  adminData.requests[index].status = nextStatus;
  saveData();
  renderRequestsTable();
  updateDashboardStats();
}

function deleteRequest(index) {
  if (confirm("Are you sure you want to delete this request?")) {
    adminData.requests.splice(index, 1);
    saveData();
    renderRequestsTable();
    updateDashboardStats();
  }
}

function showAddRequestModal() {
  alert("Add request modal will be implemented.");
}

// Update Zone Stats
function updateZoneStats() {
  for (let i = 1; i <= 5; i++) {
    const count = adminData.donors.filter((d) => d.zone == i).length;
    const element = document.getElementById(`zone${i}Donors`);
    if (element) {
      element.textContent = count;
    }
  }
}

// Listen for donor registrations from main site
window.addEventListener("storage", function (e) {
  if (e.key === "donors") {
    adminData.donors = JSON.parse(e.newValue) || [];
    if (document.getElementById("adminDashboard").style.display === "flex") {
      initializeDashboard();
    }
  }
});

// Add sample data if none exists
if (adminData.donors.length === 0) {
  // Sample donors
  adminData.donors = [
    {
      fullname: "John Doe",
      age: 28,
      gender: "male",
      rh: "+",
      bloodgroup: "A+",
      zone: "1",
      phone: "9876543210",
      email: "john@example.com",
      address: "Serampore, Hooghly",
      registeredDate: "2025-11-01",
    },
    {
      fullname: "Jane Smith",
      age: 32,
      gender: "female",
      rh: "-",
      bloodgroup: "O-",
      zone: "2",
      phone: "9876543211",
      email: "jane@example.com",
      address: "Chinsurah, Hooghly",
      registeredDate: "2025-11-05",
    },
  ];

  // Sample appointments
  adminData.appointments = [
    {
      donorName: "John Doe",
      date: "2025-11-15",
      time: "10:00 AM",
      zone: "1",
      status: "confirmed",
    },
    {
      donorName: "Jane Smith",
      date: "2025-11-16",
      time: "11:00 AM",
      zone: "2",
      status: "pending",
    },
  ];

  // Sample requests
  adminData.requests = [
    {
      patientName: "Robert Johnson",
      bloodType: "A+",
      units: 2,
      hospital: "City Hospital",
      urgency: "urgent",
      status: "pending",
    },
    {
      patientName: "Mary Williams",
      bloodType: "O-",
      units: 1,
      hospital: "District Hospital",
      urgency: "normal",
      status: "approved",
    },
  ];

  saveData();
}

// Enquiry Management Functions
function renderEnquiriesTable() {
  const tbody = document.getElementById("enquiriesTableBody");

  if (adminData.enquiries.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">No enquiries found</td></tr>';
    return;
  }

  tbody.innerHTML = adminData.enquiries
    .map((enq, index) => {
      const workflowStatus = getWorkflowStatus(enq.workflow);
      const date = new Date(enq.submittedDate).toLocaleDateString();

      return `
        <tr>
            <td>${enq.id}</td>
            <td>${enq.name}</td>
            <td>${enq.type}</td>
            <td>${enq.category}</td>
            <td><span class="status-badge status-${enq.priority}">${enq.priority}</span></td>
            <td>${workflowStatus}</td>
            <td><span class="status-badge status-${enq.status}">${enq.status}</span></td>
            <td>${date}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewEnquiry(${index})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="updateEnquiryWorkflow(${index})">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteEnquiry(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    })
    .join("");
}

function getWorkflowStatus(workflow) {
  if (!workflow) return "Submitted";
  if (workflow.delivered) return "✅ Delivered";
  if (workflow.responsePrepared) return "📝 Response Ready";
  if (workflow.routed) return "📍 Routed";
  if (workflow.categorized) return "🏷️ Categorized";
  if (workflow.validated) return "✓ Validated";
  return "📨 Submitted";
}

function viewEnquiry(index) {
  const enq = adminData.enquiries[index];
  let details = `Enquiry Details\\n\\n`;
  details += `ID: ${enq.id}\\n`;
  details += `Name: ${enq.name}\\n`;
  details += `Email: ${enq.email}\\n`;
  details += `Phone: ${enq.phone}\\n`;
  details += `Type: ${enq.type}\\n`;
  details += `Category: ${enq.category}\\n`;
  details += `Priority: ${enq.priority}\\n`;
  details += `Routed To: ${enq.routedTo}\\n`;
  details += `Message: ${enq.message}\\n\\n`;

  if (enq.bloodRequest) {
    details += `Blood Request Details:\\n`;
    details += `Patient: ${enq.bloodRequest.patientName}\\n`;
    details += `Blood Type: ${enq.bloodRequest.bloodType}\\n`;
    details += `Units: ${enq.bloodRequest.units}\\n`;
    details += `Urgency: ${enq.bloodRequest.urgency}\\n`;
    details += `Hospital: ${enq.bloodRequest.hospital}\\n`;
    details += `Required By: ${enq.bloodRequest.requiredBy}\\n`;
  }

  if (enq.appointment) {
    details += `Appointment Details:\\n`;
    details += `Date: ${enq.appointment.date}\\n`;
    details += `Time: ${enq.appointment.time}\\n`;
    details += `Zone: ${enq.appointment.zone}\\n`;
  }

  alert(details);
}

function updateEnquiryWorkflow(index) {
  const enq = adminData.enquiries[index];
  const workflow = enq.workflow;

  if (!workflow.responsePrepared) {
    workflow.responsePrepared = true;
    enq.status = "in-progress";
    alert("Workflow updated: Response Prepared ✓");
  } else if (!workflow.delivered) {
    workflow.delivered = true;
    enq.status = "responded";
    alert("Workflow updated: Response Delivered ✓");
  } else {
    enq.status = "closed";
    alert("Enquiry marked as Closed");
  }

  saveData();
  renderEnquiriesTable();
}

function deleteEnquiry(index) {
  if (confirm("Are you sure you want to delete this enquiry?")) {
    adminData.enquiries.splice(index, 1);
    saveData();
    renderEnquiriesTable();
  }
}

function filterEnquiries(type) {
  const tbody = document.getElementById("enquiriesTableBody");
  const filtered =
    type === "all"
      ? adminData.enquiries
      : adminData.enquiries.filter((enq) => enq.type === type);

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">No matching enquiries found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((enq) => {
      const originalIndex = adminData.enquiries.indexOf(enq);
      const workflowStatus = getWorkflowStatus(enq.workflow);
      const date = new Date(enq.submittedDate).toLocaleDateString();

      return `
        <tr>
            <td>${enq.id}</td>
            <td>${enq.name}</td>
            <td>${enq.type}</td>
            <td>${enq.category}</td>
            <td><span class="status-badge status-${enq.priority}">${enq.priority}</span></td>
            <td>${workflowStatus}</td>
            <td><span class="status-badge status-${enq.status}">${enq.status}</span></td>
            <td>${date}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewEnquiry(${originalIndex})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="updateEnquiryWorkflow(${originalIndex})">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteEnquiry(${originalIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    })
    .join("");
}

function filterEnquiriesByStatus(status) {
  const tbody = document.getElementById("enquiriesTableBody");
  const filtered =
    status === "all"
      ? adminData.enquiries
      : adminData.enquiries.filter((enq) => enq.status === status);

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">No matching enquiries found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((enq) => {
      const originalIndex = adminData.enquiries.indexOf(enq);
      const workflowStatus = getWorkflowStatus(enq.workflow);
      const date = new Date(enq.submittedDate).toLocaleDateString();

      return `
        <tr>
            <td>${enq.id}</td>
            <td>${enq.name}</td>
            <td>${enq.type}</td>
            <td>${enq.category}</td>
            <td><span class="status-badge status-${enq.priority}">${enq.priority}</span></td>
            <td>${workflowStatus}</td>
            <td><span class="status-badge status-${enq.status}">${enq.status}</span></td>
            <td>${date}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewEnquiry(${originalIndex})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-edit" onclick="updateEnquiryWorkflow(${originalIndex})">
                    <i class="fas fa-tasks"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteEnquiry(${originalIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
    })
    .join("");
}

// Listen for enquiries from main site
window.addEventListener("storage", function (e) {
  if (e.key === "enquiries") {
    adminData.enquiries = JSON.parse(e.newValue) || [];
    if (document.getElementById("adminDashboard").style.display === "flex") {
      renderEnquiriesTable();
      updateDashboardStats();
    }
  }
});

// Periodically check for new enquiries (every 3 seconds)
setInterval(function () {
  if (document.getElementById("adminDashboard").style.display === "flex") {
    const currentEnquiries =
      JSON.parse(localStorage.getItem("enquiries")) || [];
    if (
      JSON.stringify(currentEnquiries) !== JSON.stringify(adminData.enquiries)
    ) {
      adminData.enquiries = currentEnquiries;
      const activeSection = document.querySelector(".content-section.active");
      if (activeSection && activeSection.id === "enquiriesSection") {
        renderEnquiriesTable();
      }
      updateDashboardStats();
    }
  }
}, 3000);

const API_BASE_URL = 'http://localhost:5000'; 

async function runVerification() {
    console.log("--- Starting Student Approval Verification ---");

    const testEmail = `test_student_${Date.now()}@example.com`;
    const password = 'Password@123';

    try {
        // 1. Register a new student
        console.log(`1. Registering student: ${testEmail}`);
        const regRes = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: "Test Student",
                email: testEmail,
                collegeId: "6790d9899142ec4cf6055bc5", 
                department: "Computer Science",
                yearOfStudy: "3rd Year",
                password: password,
                role: "student"
            })
        });
        const regData = await regRes.json();
        console.log("Registration Response:", regData);

        // 2. Attempt Login (Should fail)
        console.log("\n2. Attempting login as unapproved student...");
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: password })
        });
        const loginData = await loginRes.json();
        console.log("Login Status:", loginRes.status, "Message:", loginData.message);

        // 3. Login as Admin to get Token
        console.log("\n3. Logging in as Admin...");
        const adminLoginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "rv.kalam.admin@gmail.com", 
                password: "Password@123"
            })
        });
        const adminLoginData = await adminLoginRes.json();
        if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${adminLoginData.message}`);
        const adminToken = adminLoginData.token;
        console.log("Admin logged in.");

        // 4. Fetch Pending Students
        console.log("\n4. Fetching pending students...");
        const pendingRes = await fetch(`${API_BASE_URL}/admin/students/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pendingData = await pendingRes.json();
        if (!pendingRes.ok) {
            console.error("FAIL: Pending students fetch error:", pendingData);
            return;
        }

        if (!pendingData.students) {
            console.error("FAIL: 'students' field missing in response:", pendingData);
            return;
        }

        const student = pendingData.students.find(s => s.email === testEmail);
        
        if (student) {
            console.log(`Found pending student: ${student.fullName} (${student._id})`);

            // 5. Approve Student
            console.log("\n5. Approving student...");
            const approveRes = await fetch(`${API_BASE_URL}/admin/students/${student._id}/approve`, {
                method: 'PATCH',
                headers: { 
                    Authorization: `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const approveData = await approveRes.json();
            console.log("Approval Status:", approveRes.status, "Message:", approveData.message);

            // 6. Attempt Login again (Should succeed)
            console.log("\n6. Attempting login as approved student...");
            const finalLoginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail, password: password })
            });
            const finalLoginData = await finalLoginRes.json();
            if (finalLoginRes.ok) {
                console.log("SUCCESS: Login successful! Role:", finalLoginData.role);
            } else {
                console.error("FAIL: Final login failed:", finalLoginData.message);
            }
        } else {
            console.error("FAIL: Could not find the new student in pending list. Pending list emails:", pendingData.students.map(s => s.email));
        }

    } catch (err) {
        console.error("Verification error:", err.message);
    }
}

runVerification();

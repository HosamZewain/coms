"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:3000/api';
let token = '';
let userId = '';
const testClient = axios_1.default.create({
    baseURL: API_URL,
    validateStatus: () => true // Don't throw on error status
});
async function runTests() {
    console.log('🚀 Starting System Smoke Test...\n');
    // 1. Health Check
    console.log('1. Testing Health Endpoint...');
    const health = await testClient.get('/health');
    if (health.status === 200)
        console.log('✅ Backend is UP');
    else
        console.error('❌ Backend is DOWN', health.data);
    // 2. Register
    console.log('\n2. Testing Registration...');
    const regEmail = `admin_${Date.now()}@tcoms.com`;
    const register = await testClient.post('/auth/register', {
        email: regEmail,
        password: 'password123',
        firstName: 'System',
        lastName: 'Admin'
    });
    if (register.status === 201) {
        console.log('✅ Registration Successful');
        userId = register.data.data.id;
    }
    else {
        console.error('❌ Registration Failed', register.data);
        // Try login if already exists (unlikely with timestamp)
    }
    // 3. Login
    console.log('\n3. Testing Login...');
    const login = await testClient.post('/auth/login', {
        email: regEmail,
        password: 'password123'
    });
    if (login.status === 200) {
        console.log('✅ Login Successful');
        token = login.data.data.token;
        testClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    else {
        console.error('❌ Login Failed', login.data);
        return;
    }
    // 4. Create Department
    console.log('\n4. Testing Company: Create Department...');
    const dept = await testClient.post('/company/departments', {
        name: `Engineering_${Date.now()}`
    });
    if (dept.status === 201)
        console.log('✅ Department Created');
    else
        console.error('❌ Create Department Failed', dept.data);
    // 5. Create Job (Recruitment)
    console.log('\n5. Testing Recruitment: Create Job...');
    const job = await testClient.post('/recruitment/jobs', {
        title: 'Senior Developer',
        description: 'Node.js expert needed'
    });
    if (job.status === 201)
        console.log('✅ Job Created');
    else
        console.error('❌ Create Job Failed', job.data);
    // 6. Punch In (Attendance)
    console.log('\n6. Testing Attendance: Punch In...');
    const punchIn = await testClient.post('/attendance/punch-in', {
        location: 'OFFICE',
        projectId: 'GENERIC', // MVP didn't enforce specific project existence in DB yet for string field
        task: 'System Testing'
    });
    if (punchIn.status === 201)
        console.log('✅ Punch In Successful');
    else
        console.error('❌ Punch In Failed', punchIn.data);
    // 7. Create Project (PM)
    console.log('\n7. Testing PM: Create Project...');
    const project = await testClient.post('/pm/projects', {
        name: 'TCOMS ERP',
        description: 'Internal System'
    });
    if (project.status === 201) {
        console.log('✅ Project Created');
        const projectId = project.data.data.id;
        // 8. Create Task
        console.log('\n8. Testing PM: Create Task...');
        const task = await testClient.post('/pm/tasks', {
            title: 'Verify Verification',
            projectId: projectId,
            assigneeId: userId
        });
        if (task.status === 201)
            console.log('✅ Task Created');
        else
            console.error('❌ Create Task Failed', task.data);
    }
    else {
        console.error('❌ Create Project Failed', project.data);
    }
    console.log('\n✨ Smoke Test Completed');
}
runTests();

// src/routes/employees.ts
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Define employee interface
interface Employee {
  employee_id: number;
  name: string;
  gender?: string;
  dates_of_birth?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  department?: string;
  emergency_contacts?: string;
  // Add other fields as needed
}

const router = express.Router();

// Get file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '..', 'data', 'employees.json');

// Get all employees
router.get('/', (req, res) => {
  try {
    const employeesData = fs.readFileSync(dataPath, 'utf8');
    const employees = JSON.parse(employeesData) as Employee[];
    
    res.json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error reading employees data:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to retrieve employees data'
    });
  }
});

// Get employees by last name (with wildcard support via query parameter)
router.get('/search', (req, res) => {
  try {
    const lastName = req.query.lastname as string;
    
    if (!lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Last name search term is required as a query parameter: /api/employees/search?lastname=smith'
      });
    }

    const lowerCaseLastName = lastName.toLowerCase();
    const employeesData = fs.readFileSync(dataPath, 'utf8');
    const employees = JSON.parse(employeesData) as Employee[];
    
    // Extract last name from the full name and match with wildcard functionality
    const matchingEmployees = employees.filter((emp: Employee) => {
      if (!emp.name) return false;
      
      // Split the name and get the last part as the last name
      const nameParts = emp.name.split(' ');
      const empLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : emp.name;
      
      // Case insensitive search with wildcard functionality
      return empLastName.toLowerCase().includes(lowerCaseLastName);
    });
    
    res.json({
      status: 'success',
      count: matchingEmployees.length,
      data: matchingEmployees
    });
  } catch (error) {
    console.error('Error searching employees by last name:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search employees by last name'
    });
  }
});

// Get employee by ID
router.get('/:id', (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    if (isNaN(employeeId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid employee ID format'
      });
    }

    const employeesData = fs.readFileSync(dataPath, 'utf8');
    const employees = JSON.parse(employeesData) as Employee[];
    
    const employee = employees.find((emp: Employee) => emp.employee_id === employeeId);
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${employeeId} not found`
      });
    }
    
    res.json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Error retrieving employee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve employee data'
    });
  }
});

export default router;

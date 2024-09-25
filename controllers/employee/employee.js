import Joi from "joi";
import employeeModel from "../../models/employeeModel.js";

// Joi Validation Schema for Employee
const validateEmployee = (employee) => {
    const schema = Joi.object({
        adminId: Joi.string().optional(),
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(10).max(15).required(),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zipCode: Joi.string().required()
        }).required(),
        dateOfBirth: Joi.date().required(),
        hireDate: Joi.date().default(Date.now),
        position: Joi.string().required(),
        salary: Joi.number().required(),
        employeeThumbnail: Joi.any().optional(),
        employeeDocument: Joi.any().optional(),
    });

    return schema.validate(employee);
};

// Add Employee
const addEmployee = async (req, res) => {

    
    console.log(req.body)
    console.log(req.files)
    // Extract necessary fields from request body
    const { firstName, lastName, email, phone, address, dateOfBirth, hireDate, position, salary } = req.body;
    const adminId = req.user.adminId || req.user._id;
    const employeeThumbnail = req.files?.employeeThumbnail?.map(file => file.filename) || [];
    const employeeDocument = req.files?.employeeDocument?.map(file => file.filename) || [];;


    // Validate request data using Joi
    const { error } = validateEmployee(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const newEmployee = new employeeModel({
            firstName,
            lastName,
            email,
            phone,
            address,
            dateOfBirth,
            hireDate,
            position,
            salary,
            adminId,
            employeeThumbnail,
            employeeDocument
        });

        await newEmployee.save();
        res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (err) {
        res.status(400).json({ message: 'Failed to add employee', error: err.message });
    }
};

// Get All Employees
const getAllEmployees = async (req, res) => {
    const adminId = req.user.adminId || req.user._id;

    try {
        const employees = await employeeModel.find({ adminId });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
    }
};



// Edit Employee by ID
const editEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, dateOfBirth, hireDate, position, salary } = req.body;

    // Extract files from request
    const newEmployeeDocuments = req.files?.employeeDocument?.map(file => file.filename) || [];
    const newEmployeeThumbnails = req.files?.employeeThumbnail?.map(file => file.filename) || [];

    // Validate request data using Joi
    const { error } = validateEmployee(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        // Find the employee
        const employee = await employeeModel.findById(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Update employee fields
        employee.firstName = firstName;
        employee.lastName = lastName;
        employee.email = email;
        employee.phone = phone;
        employee.address = address;
        employee.dateOfBirth = dateOfBirth;
        employee.hireDate = hireDate;
        employee.position = position;
        employee.salary = salary;

        // Update thumbnail if a new one is provided
        if (newEmployeeThumbnails.length > 0) {
            employee.employeeThumbnail = newEmployeeThumbnails[0]; 
        }

        // Push new documents into existing array (if any)
        if (newEmployeeDocuments.length > 0) {
            employee.employeeDocument.push(...newEmployeeDocuments);
        }

        // Save the updated employee
        await employee.save();

        res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update employee', error: error.message });
    }
};




// Delete Employee by ID
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    console.log(id)

    try {
        const deletedEmployee = await employeeModel.findByIdAndDelete(id);
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
};

// Update Employee's isActive Status
const updateEmployeeStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // Validate isActive value using Joi
    const schema = Joi.object({
        status: Joi.string().valid("active", "deactive").required()
    });

    const { error } = schema.validate({ status });
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const employee = await employeeModel.findById(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        employee.status = status;
        await employee.save();

        res.status(200).json({ message: 'Employee status updated successfully', employee });
    } catch (error) {
        res.status(400).json({ message: 'Failed to update employee status', error: error.message });
    }
};

// Export all controller functions
export {
    addEmployee,
    getAllEmployees,
    editEmployee,
    deleteEmployee,
    updateEmployeeStatus
};

// ==================================================
// OQ Rewards Nomination Form - Main Application
// Employee Database & Auto-fill Logic
// ==================================================

// Employee Database (mock data based on OQ structure)
const employeesDB = [
    { id: "10045", fullName: "Amira Al-Hinai", function: "Global Marketing", department: "Marketing Excellence", manager: "Nadia Al-Rawahi", email: "amira.alhinai@oq.com", joinDate: "2021-03-12" },
    { id: "10087", fullName: "Khalid Al-Rawahi", function: "Assets Management", department: "Asset Strategy", manager: "Tariq Al-Balushi", email: "khalid.alrawahi@oq.com", joinDate: "2019-11-01" },
    { id: "10123", fullName: "Fatima Al-Balushi", function: "HSSE RPI", department: "HSSE & Quality", manager: "Rashid Al-Saadi", email: "fatima.balushi@oq.com", joinDate: "2022-06-20" },
    { id: "10234", fullName: "Ahmed Al-Mahrooqi", function: "Polymers Operations", department: "Operations", manager: "Salem Al-Harthi", email: "ahmed.mahrooqi@oq.com", joinDate: "2020-09-15" },
    { id: "10356", fullName: "Maryam Al-Kindi", function: "People & Culture", department: "HR Business Partners", manager: "Huda Al-Siyabi", email: "maryam.kindi@oq.com", joinDate: "2018-04-22" },
    { id: "10478", fullName: "Salem Al-Harthi", function: "OQ Logistics", department: "Supply Chain", manager: "Youssef Al-Hasani", email: "salem.harthi@oq.com", joinDate: "2017-12-05" },
    { id: "10599", fullName: "Noor Al-Saidi", function: "Business Planning", department: "Corporate Planning", manager: "Khalid Al-Mamari", email: "noor.saidi@oq.com", joinDate: "2023-01-18" },
    { id: "10633", fullName: "Hassan Al-Siyabi", function: "Technical Services", department: "Engineering", manager: "Layla Al-Hasani", email: "hassan.siyabi@oq.com", joinDate: "2020-08-30" },
    { id: "10777", fullName: "Layla Al-Hasani", function: "Global Sales", department: "Commercial", manager: "Omar Al-Kindi", email: "layla.hasani@oq.com", joinDate: "2019-05-14" },
    { id: "10888", fullName: "Youssef Al-Mamari", function: "RPI Operations", department: "Refinery Ops", manager: "Iman Al-Rawahi", email: "youssef.mamari@oq.com", joinDate: "2021-11-02" },
    { id: "10999", fullName: "Muna Al-Hosni", function: "Financial Control", department: "Finance", manager: "Hassan Al-Balushi", email: "muna.hosni@oq.com", joinDate: "2022-09-11" },
    { id: "11012", fullName: "Rashid Al-Riyami", function: "Procurement", department: "Strategic Sourcing", manager: "Ahmed Al-Kaabi", email: "rashid.riyami@oq.com", joinDate: "2023-03-01" },
    { id: "11123", fullName: "Iman Al-Malki", function: "Business Excellence", department: "Continuous Improvement", manager: "Nadia Al-Hinai", email: "iman.malki@oq.com", joinDate: "2022-08-14" },
    { id: "11234", fullName: "Tariq Al-Balushi", function: "Transformation & Business Excellence", department: "Strategy", manager: "Khalid Al-Rawahi", email: "tariq.balushi@oq.com", joinDate: "2020-01-20" }
];

// Award categories from original spec
const awardCategoriesList = [
    "Impact on HSSE",
    "Impact on OQ Behaviors",
    "Quick Wins",
    "Innovation Initiatives",
    "Promoting OQ Learning Culture",
    "Developing Others",
    "Lean Initiatives",
    "Integration Initiatives",
    "Managing Unique Circumstances",
    "Impact on Sustainability",
    "Reliability Improvement",
    "Integration & Harmonization",
    "Process Safety",
    "Others"
];

const rewardTypesList = ["Above and Beyond Award", "Spot Award", "Team Award"];

// Helper function to find employee
const findEmployee = (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === "") return null;
    const query = searchQuery.trim().toLowerCase();
    
    // Exact ID match
    let emp = employeesDB.find(e => e.id.toLowerCase() === query);
    if (emp) return emp;
    
    // Exact name match
    emp = employeesDB.find(e => e.fullName.toLowerCase() === query);
    if (emp) return emp;
    
    // Partial name match
    emp = employeesDB.find(e => e.fullName.toLowerCase().includes(query));
    return emp || null;
};

// Main React Component
const NominationForm = () => {
    // Search state
    const [searchInput, setSearchInput] = React.useState("");
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);
    const [searchError, setSearchError] = React.useState("");
    
    // Employee fields (auto-filled)
    const [employeeId, setEmployeeId] = React.useState("");
    const [fullName, setFullName] = React.useState("");
    const [functionDept, setFunctionDept] = React.useState("");
    const [department, setDepartment] = React.useState("");
    const [managerName, setManagerName] = React.useState("");
    const [email, setEmail] = React.useState("");
    
    // Award fields
    const [rewardType, setRewardType] = React.useState("Above and Beyond Award");
    const [awardCategory, setAwardCategory] = React.useState([]);
    const [justification, setJustification] = React.useState("");
    
    // UI state
    const [saveMessage, setSaveMessage] = React.useState("");
    const [submitMessage, setSubmitMessage] = React.useState("");
    
    const submissionDate = new Date().toISOString().slice(0, 10);
    
    // Populate form from employee
    const populateFromEmployee = (emp) => {
        if (emp) {
            setEmployeeId(emp.id);
            setFullName(emp.fullName);
            setFunctionDept(emp.function);
            setDepartment(emp.department);
            setManagerName(emp.manager);
            setEmail(emp.email);
            setSearchError("");
        } else {
            setEmployeeId("");
            setFullName("");
            setFunctionDept("");
            setDepartment("");
            setManagerName("");
            setEmail("");
        }
    };
    
    // Handle employee search
    const handleSearchEmployee = () => {
        if (!searchInput.trim()) {
            setSearchError("Please enter Employee ID or Full Name");
            return;
        }
        const emp = findEmployee(searchInput);
        if (emp) {
            setSelectedEmployee(emp);
            populateFromEmployee(emp);
            setSearchError("");
        } else {
            setSelectedEmployee(null);
            populateFromEmployee(null);
            setSearchError(`No employee found matching "${searchInput}"`);
        }
    };
    
    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchEmployee();
        }
    };
    
    // Toggle category selection
    const handleCategoryToggle = (cat) => {
        if (awardCategory.includes(cat)) {
            setAwardCategory(awardCategory.filter(c => c !== cat));
        } else {
            setAwardCategory([...awardCategory, cat]);
        }
    };
    
    // Validate form before submit
    const validateForm = () => {
        if (!selectedEmployee) {
            setSearchError("Please search and select a valid employee before submitting.");
            return false;
        }
        if (awardCategory.length === 0) {
            alert("⚠ Please select at least one Award Category.");
            return false;
        }
        if (!justification.trim() || justification.trim().length < 10) {
            alert("⚠ Please provide a detailed justification (minimum 10 characters).");
            return false;
        }
        return true;
    };
    
    // Save draft to localStorage
    const handleSave = () => {
        if (!selectedEmployee) {
            setSaveMessage("❗ Cannot save: No employee selected.");
            setTimeout(() => setSaveMessage(""), 2500);
            return;
        }
        
        const draft = {
            employeeId, fullName, functionDept, department, managerName, email,
            rewardType, awardCategory, justification, submissionDate,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem("oq_nomination_draft", JSON.stringify(draft));
        setSaveMessage("✅ Draft saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
    };
    
    // Submit nomination
    const handleSubmit = () => {
        if (!validateForm()) return;
        
        const nominationRecord = {
            id: "NOM-" + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, ''),
            employeeId: employeeId,
            employeeName: fullName,
            function: functionDept,
            department: department,
            rewardType: rewardType,
            awardCategory: awardCategory.join("; "),
            justification: justification,
            nominationDate: submissionDate,
            managerName: managerName,
            status: "Pending",
            email: email,
            submittedBy: "Current User",
            submittedAt: new Date().toISOString()
        };
        
        // Log to console for demo
        console.log("✅ Nomination Submitted:", nominationRecord);
        
        // Store in localStorage history
        const history = JSON.parse(localStorage.getItem("oq_nomination_history") || "[]");
        history.push(nominationRecord);
        localStorage.setItem("oq_nomination_history", JSON.stringify(history));
        
        setSubmitMessage(`🎉 Nomination for ${fullName} (${rewardType}) submitted successfully!`);
        
        setTimeout(() => {
            setSubmitMessage("");
        }, 4000);
        
        alert(`🏆 Nomination Submitted!\n\nEmployee: ${fullName}\nReward: ${rewardType}\nCategories: ${awardCategory.join(", ")}\n\nThank you for recognizing excellence at OQ!`);
    };
    
    // Clear entire form
    const clearForm = () => {
        setSearchInput("");
        setSelectedEmployee(null);
        setEmployeeId("");
        setFullName("");
        setFunctionDept("");
        setDepartment("");
        setManagerName("");
        setEmail("");
        setAwardCategory([]);
        setJustification("");
        setRewardType("Above and Beyond Award");
        setSearchError("");
        setSaveMessage("");
        setSubmitMessage("");
    };
    
    // Load draft if exists on mount
    React.useEffect(() => {
        const draft = localStorage.getItem("oq_nomination_draft");
        if (draft) {
            const shouldLoad = confirm("You have a saved draft. Would you like to load it?");
            if (shouldLoad) {
                try {
                    const data = JSON.parse(draft);
                    // Find employee by ID from draft
                    const emp = employeesDB.find(e => e.id === data.employeeId);
                    if (emp) {
                        setSelectedEmployee(emp);
                        setEmployeeId(emp.id);
                        setFullName(emp.fullName);
                        setFunctionDept(emp.function);
                        setDepartment(emp.department);
                        setManagerName(emp.manager);
                        setEmail(emp.email);
                        setRewardType(data.rewardType || "Above and Beyond Award");
                        setAwardCategory(data.awardCategory || []);
                        setJustification(data.justification || "");
                    }
                } catch (e) {
                    console.error("Failed to load draft", e);
                }
            }
        }
    }, []);
    
    return (
        <div className="form-canvas">
            <div className="header">
                <h1>📋 OQ Rewards Nomination</h1>
                <p>Above and Beyond Award — Smart nomination form (auto-fill by Employee ID / Name)</p>
            </div>
            
            <div className="form-content">
                {(saveMessage || submitMessage) && (
                    <div className="success-toast">
                        {saveMessage || submitMessage}
                    </div>
                )}
                
                {/* Search Section */}
                <div className="section-card search-employee-group">
                    <div className="section-title">
                        <span>🔍</span> Step 1: Identify Employee
                    </div>
                    <div className="inline-search">
                        <div className="form-group">
                            <label>Employee ID or Full Name *</label>
                            <input 
                                type="text"
                                placeholder="e.g. 10045 or Amira Al-Hinai"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            {searchError && <div className="error-message">⚠ {searchError}</div>}
                        </div>
                        <button className="search-btn" onClick={handleSearchEmployee}>🔎 Search & Load</button>
                        <button className="search-btn" style={{background: '#6c7a8e'}} onClick={clearForm}>Clear</button>
                    </div>
                    <div className="badge-category-hint" style={{marginTop: '12px'}}>
                        💡 After search, employee details, function, department, manager will be auto-filled.
                    </div>
                </div>
                
                {/* Employee Information */}
                <div className="section-card">
                    <div className="section-title">
                        <span>👤</span> Employee Details (Auto-filled)
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee ID</label>
                            <input type="text" value={employeeId} readOnly disabled />
                        </div>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={fullName} readOnly disabled />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Function / Business Unit</label>
                            <input type="text" value={functionDept} readOnly disabled />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" value={department} readOnly disabled />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Direct Manager</label>
                            <input type="text" value={managerName} readOnly disabled />
                        </div>
                        <div className="form-group">
                            <label>Company Email</label>
                            <input type="text" value={email} readOnly disabled />
                        </div>
                    </div>
                </div>
                
                {/* Award Details */}
                <div className="section-card">
                    <div className="section-title">
                        <span>🏆</span> Award Details
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Reward Type *</label>
                            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}>
                                {rewardTypesList.map(rt => (
                                    <option key={rt} value={rt}>{rt}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nomination Date</label>
                            <input type="text" value={submissionDate} readOnly disabled />
                            <div className="badge-category-hint">Automatically set to today</div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Award Category * (select all that apply)</label>
                        <div className="category-checkbox-group">
                            {awardCategoriesList.map(cat => (
                                <label 
                                    key={cat} 
                                    className={`category-option ${awardCategory.includes(cat) ? 'selected' : ''}`}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={awardCategory.includes(cat)}
                                        onChange={() => handleCategoryToggle(cat)}
                                    />
                                    <span>{cat}</span>
                                </label>
                            ))}
                        </div>
                        {awardCategory.length === 0 && (
                            <div className="error-message" style={{marginTop: '12px'}}>
                                ⚠ Select at least one category
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Justification */}
                <div className="section-card">
                    <div className="section-title">
                        <span>✍️</span> Justification & Impact
                    </div>
                    <div className="form-group">
                        <label>Detailed Justification * (specific examples & outcomes)</label>
                        <textarea 
                            rows="5" 
                            placeholder="Describe the employee's contribution, impact on OQ values, safety, innovation, or business results..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            style={{resize: 'vertical'}}
                        ></textarea>
                        <div className="badge-category-hint">
                            {justification.length} characters (minimum 10 recommended)
                        </div>
                    </div>
                </div>
                
                {/* Attachments */}
                <div className="section-card">
                    <div className="section-title">
                        <span>📎</span> Attachments (Optional)
                    </div>
                    <div className="form-group">
                        <label>Supporting Documents</label>
                        <input type="file" multiple accept=".pdf,.jpg,.png,.docx" />
                        <div className="badge-category-hint">
                            Upload evidence (max 5MB per file) - optional
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn-save" onClick={handleSave}>💾 Save Draft</button>
                    <button className="btn-submit" onClick={handleSubmit}>📨 Submit Nomination</button>
                </div>
                
                <div className="footer-note">
                    * All fields marked with auto-fill are linked to Employee ID. 
                    Award categories & justification required for submission.
                    <br />
                    <span style={{fontSize: '0.65rem', opacity: 0.7}}>
                        OQ Rewards & Recognition Program — Celebrating Excellence
                    </span>
                </div>
            </div>
        </div>
    );
};

// Render the app
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<NominationForm />);
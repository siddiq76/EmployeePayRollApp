window.addEventListener('DOMContentLoaded', function () {
    const name = document.querySelector('#name');
    const textError = document.querySelector('.text-error');
    name.addEventListener('input', function () {
        if (name.value.length == 0) {
            textError.textContent = "";
            return;
        }

        try {
            checkName(name.value);
            textError.textContent = "";
        } catch (e) {
            textError.textContent = e;
        }
    });

    const salary = document.querySelector('#salary');
    const output = document.querySelector('.salary-output');
    output.textContent = salary.value;
    salary.addEventListener('input', function () {
        output.textContent = salary.value;
    });

    const date = document.querySelector('#startDate');
    date.addEventListener('input', function () {
        let startDate = getInputValueById('#startDate');
        try {
            checkDate(new Date(Date.parse(startDate)));
            setTextValue('.date-error', "");
        } catch (error) {
            setTextValue('.date-error', error);
        }
    });

    document.querySelector('#cancelButton').href = site_properties.home_page;
    checkForUpdate();

});

const checkName = (name) => {
    let nameRegex = RegExp('^([A-Z]{1}[a-z]{3,})+(\\s)+([A-Z]{1}[a-z]{3,})$');
    if (!nameRegex.test(name))
        throw 'Name is incorrect';
};

const checkDate = (date) => {
    let now = new Date();
    if (date > now) throw 'Start date is future date';
    var diff = Math.abs(now.getTime() - date.getTime());
    if (diff / (1000 * 60 * 60 * 24) > 30)
        throw 'Start date beyond 30 days';
};

/**
 * Save the form in the HTML local storage
 */
const save = (event) => {
    if (site_properties.use_local_storage.match("false")) {
        createOrUpdateEmployeePayroll();
        return;
    }
    if (isUpdate) {
        storageUpdate();
        window.location.href = site_properties.home_page;
    }
    else {
        try {
            let employeePayrollData = createEmployeePayroll();
            createAndUpdateStorage(employeePayrollData);
        } catch (error) {
            alert(error);
            return;
        }
    }
};

const storageUpdate = () => {
    console.log("update storage");
    isUpdate = false;
    const employeePayrollJson = localStorage.getItem("editEmp");
    let employeePayrollObj = JSON.parse(employeePayrollJson);
    const id = employeePayrollObj.id;
    let employeePayrollData = createEmployeePayroll(id);
    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
    const index = employeePayrollList.map(empData => empData.id)
        .indexOf(employeePayrollData.id);
    employeePayrollList.splice(index, 1, employeePayrollData);
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList));

    return;
};

const createEmployeePayroll = (id) => {
    let employeePayrollData = createPayrollObj();
    if (!id) employeePayrollData.employeeId = generateEmployeeId();
    else employeePayrollData.employeeId = id;

    return employeePayrollData;
};

function createAndUpdateStorage(employeePayrollData) {

    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));

    if (employeePayrollList != undefined) {
        employeePayrollList.push(employeePayrollData);
    } else {
        employeePayrollList = [employeePayrollData];
    }
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList));

}

let createPayrollObj = () => {
    try {
        checkName(getInputValueById('#name'));
        checkDate(new Date(Date.parse(getInputValueById('#startDate'))));
    } catch (error) {
        alert(error.toString());
        return;
    }

    let employeePayrollObj = {};

    employeePayrollObj.name = getInputValueById('#name');
    employeePayrollObj.profilePic = getSelectedValues('[name=profile]').pop();
    employeePayrollObj.gender = getSelectedValues('[name=gender]').pop();
    employeePayrollObj.department = getSelectedValues('[name=department]');
    employeePayrollObj.salary = getInputValueById('#salary');
    employeePayrollObj.note = getInputValueById('#notes');
    employeePayrollObj.startDate = getInputValueById('#startDate');

    return employeePayrollObj;
};

const createOrUpdateEmployeePayroll = () => {
    let URL = site_properties.server_url + "create/";
    let methodCall = "POST";
    if (isUpdate) {
        const employeePayrollJson = localStorage.getItem("editEmp");
        let employeePayroll = JSON.parse(employeePayrollJson);
        methodCall = "PUT";
        URL = site_properties.server_url + "update/" + employeePayroll.employeeId.toString();
        alert("put to:" + URL.toString());
    }
    let employeePayrollData = createPayrollObj();
    if (!employeePayrollData) return;
    makePromiseCall(methodCall, URL, true, employeePayrollData).then(responseText => {
        resetForm();
        window.location.replace(site_properties.home_page);
    }).catch(error => {
        alert(error.toString());
        throw error;
    });
};

/**
 * Reset payroll form
 */
const resetForm = () => {

    setValue('#name', '');
    unsetSelectedValues('[name=profile]');
    unsetSelectedValues('[name=gender]');
    unsetSelectedValues('[name=department]');
    setValue('#salary', '');
    setValue('#notes', '');
    setValue('#startDate', '');
};

const checkForUpdate = () => {
    const employeePayrollJson = localStorage.getItem("editEmp");
    isUpdate = employeePayrollJson ? true : false;
    if (!isUpdate) return;
    let employeePayrollObj = JSON.parse(employeePayrollJson);

    setValue('#name', employeePayrollObj.name);
    setSelectedValues('[name=profile]', employeePayrollObj.profilePic);
    setSelectedValues('[name=gender]', employeePayrollObj.gender);
    setSelectedValues('[name=department]', employeePayrollObj.department);
    setValue('#salary', employeePayrollObj.salary);
    setTextValue('.salary-output', employeePayrollObj.salary);
    setValue('#notes', employeePayrollObj.note);
    setValue('#startDate', employeePayrollObj.startDate);

};
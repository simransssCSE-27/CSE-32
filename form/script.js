const form = document.getElementById("employeeForm");

const country = document.getElementById("country");
const mobile = document.getElementById("mobile");
const mobileHint = document.getElementById("mobileHint");
const pincode = document.getElementById("pincode");

const successMessage = document.getElementById("successMessage");


/* Country-based validation */

country.addEventListener("change", function () {

    mobile.value = "";
    pincode.value = "";

    if (country.value === "India") {

        mobile.maxLength = 12;
        mobile.placeholder = "Enter 10–12 digit mobile number";

        pincode.maxLength = 6;
        pincode.placeholder = "6-digit PIN code";

        mobileHint.textContent =
            "India: mobile number must contain 10 to 12 digits.";

    }

    else {

        mobile.maxLength = 15;
        mobile.placeholder = "Enter mobile number";

        pincode.maxLength = 10;
        pincode.placeholder = "Enter PIN / ZIP code";

        mobileHint.textContent =
            "Enter your valid international mobile number.";
    }
});


/* Allow only numbers in mobile */

mobile.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

});


/* Allow only numbers in emergency contact */

document
    .getElementById("emergencyNumber")
    .addEventListener("input", function () {

        this.value = this.value.replace(/\D/g, "");

    });


/* Allow only numbers in PIN */

pincode.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

});


/* Employee ID formatting */

document
    .getElementById("employeeId")
    .addEventListener("input", function () {

        this.value = this.value
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, "");

    });


/* Form submission */

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const selectedCountry = country.value;
    const mobileNumber = mobile.value.trim();


    /* India validation */

    if (selectedCountry === "India") {

        if (!/^\d{10,12}$/.test(mobileNumber)) {

            alert(
                "Please enter a valid Indian mobile number.\n" +
                "It must contain 10 to 12 digits."
            );

            mobile.focus();
            return;
        }


        if (!/^\d{6}$/.test(pincode.value.trim())) {

            alert(
                "Please enter a valid 6-digit Indian PIN code."
            );

            pincode.focus();
            return;
        }
    }


    /* Emergency number validation */

    const emergencyNumber =
        document.getElementById("emergencyNumber").value.trim();

    if (!/^\d{10,12}$/.test(emergencyNumber)) {

        alert(
            "Emergency contact number must contain 10 to 12 digits."
        );

        document
            .getElementById("emergencyNumber")
            .focus();

        return;
    }


    /* Collect data */

    const employeeData = {

        employeeId:
            document.getElementById("employeeId").value,

        firstName:
            document.getElementById("firstName").value,

        lastName:
            document.getElementById("lastName").value,

        dateOfBirth:
            document.getElementById("dob").value,

        gender:
            document.querySelector(
                'input[name="gender"]:checked'
            )?.value,

        email:
            document.getElementById("email").value,

        department:
            document.getElementById("department").value,

        designation:
            document.getElementById("designation").value,

        employmentType:
            document.getElementById("employmentType").value,

        joiningDate:
            document.getElementById("joiningDate").value,

        qualification:
            document.getElementById("qualification").value,

        country:
            selectedCountry,

        mobile:
            mobileNumber,

        state:
            document.getElementById("state").value,

        city:
            document.getElementById("city").value,

        pincode:
            pincode.value,

        address:
            document.getElementById("address").value,

        emergencyContact:
            document.getElementById("emergencyName").value,

        relationship:
            document.getElementById("relationship").value,

        emergencyNumber:
            emergencyNumber
    };
    


    console.log("Employee Data:", employeeData);


    /* Hide form */

    form.style.display = "none";


    /* Show success message */

    successMessage.style.display = "block";

});


/* Reset */

form.addEventListener("reset", function () {

    setTimeout(function () {

        mobileHint.textContent =
            "Select country first";

    }, 0);

});
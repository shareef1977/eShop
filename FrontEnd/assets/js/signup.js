// const form = document.getElementById('form');
// const username = document.getElementById('username');
// const email = document.getElementById('email');
// const password = document.getElementById('password');
// const password2 = document.getElementById('password2');
// const mobile = document.getElementById('mobile')


// form.addEventListener('submit', e => {
    
//    if(setError){
//     e.preventDefault()
//    } else {
   
//    }
// validateInputs();
   
// });

// const setError = (element, message) => {
//     const inputControl = element.parentElement;
//     const errorDisplay = inputControl.querySelector('.error');

//     errorDisplay.innerText = message;
//     inputControl.classList.add('error');
//     inputControl.classList.remove('success')
// }

// const setSuccess = element => {
//     const inputControl = element.parentElement;
//     const errorDisplay = inputControl.querySelector('.error');

//     errorDisplay.innerText = '';
//     inputControl.classList.add('success');
//     inputControl.classList.remove('error');
// };

// const isValidEmail = email => {
//     const regx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return regx.test(String(email).toLowerCase());
// }


// const validateInputs = () => {
//     const usernameValue = username.value.trim();
//     const emailValue = email.value.trim();
//     const passwordValue = password.value.trim();
//     const password2Value = password2.value.trim();
//     const mobileValue = mobile.value.trim();

//     let a,b,c,d,e;

//     if(usernameValue === '') {

//         setError(username, 'Username is required');
//         a = 0;
//     } else if(usernameValue.length < 5 && usernameValue.length > 20) {
//         a = 0
//         setError(username, 'Username must with in 5 to 20 letters')
//     } else {
//         a = 1;
//         setSuccess(username);
//     }

//     if(emailValue === '') {
//         setError(email, 'Email is required');
//         b = 0
//     } else if (!isValidEmail(emailValue)) {
//         setError(email, 'Provide a valid email address');
//         b = 0
//     } else {
//         setSuccess(email);
//         b = 1
//     }

//     if(mobileValue === ''){
//         setError(mobile, 'Mobile number is required')
//         c = 0
//     } 
//     else if(mobileValue.length < 10 || mobileValue.length >10) {
//         setError(mobile, 'Please provide a valid mobile number')
//         c = 0
//     } 
//     else if(isNaN(mobileValue)){
//         setError(mobile, 'Please provide a valid mobile number')
//         c = 0
//     } else {
//         setSuccess(mobile)
//         c = 1
//     }

//     if(passwordValue === '') {
//         setError(password, 'Password is required');
//         d = 0
//     } else if (passwordValue.length < 6 ) {
//         setError(password, 'Password must be at least 6 character.')
//         d = 0
//     }else if (passwordValue.length>=15){
//         setError(password, 'Password must be less than 15 character.')
//         d = 0
//     } else {
//         setSuccess(password);
//         d = 1
//     }

//     if(password2Value === '') {
//         setError(password2, 'Please confirm your password');
//         e = 0
//     } else if (password2Value !== passwordValue) {
//         setError(password2, "Passwords doesn't match");
//         e = 0
//     } else {
//         setSuccess(password2);
//         e = 1
//     }

// };

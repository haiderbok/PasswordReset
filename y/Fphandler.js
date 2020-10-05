let url = window.location.href;
let code = url.slice(url.indexOf("=", url.indexOf('=') + 1) + 1, url.indexOf("&", url.indexOf("&") + 1));
/* Use javascript new Javascript ---------------------- */


let getUser = async function(email) {
    return new Promise((resolve, reject) => {
   
     db.collection("hashed_password").where("email", "==", email).get().then((userInfo) => {
       resolve(userInfo.docs[0].data());
     })
    });
   }


document.getElementById("submit-button").addEventListener("click",async  function() {

    let form = document.getElementById("register-form");
    password_form = form.elements[0].value;
    re_password_form = form.elements[1].value;

    /*Validate if the feilds are empty */
    if (password_form === "" || re_password_form === "") {
        document.getElementById("error-message").innerHTML = "Password and Confirm Password fields cannot be empty.";
        document.getElementById("register-form").reset();

    }

    /* Validate if the passwords are the same */
    else if (password_form != re_password_form) {
        document.getElementById("error-message").innerHTML = "Password and Confirm Password fields must be same.";
        document.getElementById("register-form").reset();
    } else {

        /* Use Firebase auth to change the password */
         changePassword(password_form);
          
        // const user = getUser("haiderbokha@gmail.com");
        // const Http_encrypt = new XMLHttpRequest();
        // const url = 'https://us-central1-fit-development-1452b.cloudfunctions.net/updateUserPassword/encrypt';

        
        // Http_encrypt.open('POST', url, true);
        // Http_encrypt.setRequestHeader("Content-Type", "application/json");
        // Http_encrypt.send(JSON.stringify({ oldhashpassword: user.password, password: 'password' }));

        // Http_encrypt.onreadystatechange = (e) => {
        //     console.log(Http_encrypt.responseText)
        // }
    }
});

let changePassword = (newPassword) => {

    firebase.auth().verifyPasswordResetCode(code)
        .then(async function(email) {
            
            
            const user = await getUser(email);
            const proxyurl = 'https://sleepy-sea-97283.herokuapp.com/'
            const Http_encrypt = new XMLHttpRequest();
            const url1 = 'https://us-central1-fit-development-1452b.cloudfunctions.net/encrypt';
            const combined_url = proxyurl + url1;
            // Http_encrypt.open('GET', combined_url, true);
            // Http_encrypt.setRequestHeader("Content-Type", "application/json");
            // Http_encrypt.send(JSON.stringify({ oldhashpassword: user.password, password: newPassword }));

            // Http_encrypt.onreadystatechange = (e) => {
            //     console.log(Http_encrypt.responseText)
            // }
            console.log(newPassword);
            console.log(user.password);
               let config=  {
                   method: "POST",
                   header: {
                    "Content-Type" : "application/json",
                    "Accept" : "application/json"
                   },
                   body: JSON.stringify({
                       password: newPassword,
                       oldpasswordhash: user.password
                   })
               }
           const result = fetch(combined_url, config).then (async (response) => {
                // let result = JSON.parse(response);
                const result = JSON.parse (await response.text());
                console.log(result);
                console.log(result.result);

                if (result.result == true) {
                    document.getElementById("error-message").innerHTML = "Password cannot be same as the old password.";
                    document.getElementById("register-form").reset();
                    return;
                } else {
                        const Http = new XMLHttpRequest();
                    const url = 'https://us-central1-fit-development-1452b.cloudfunctions.net/updateUserPassword';
                    
                    Http.open('POST', url, true);
                    Http.setRequestHeader("Content-Type", "application/json");
                    Http.send(JSON.stringify({ email: email, password: newPassword }));

                    Http.onreadystatechange = (e) => {
                        console.log("http response ", Http.responseText);
                        let response = JSON.parse(Http.responseText);

                        if (response.code != undefined) {
                        document.getElementById("error-message").innerHTML = response.message;
                        document.getElementById("register-form").reset();
                        } else {
                            /* hide the current content and return success */
                        document.getElementById("container").style.display = "none";

                            /* Make the Confirm password message visible */
                        document.getElementById("After-contanier").style.display = "block";

                        }

                        
                     }
                }
            })

        })
        .catch(function(error) {
            // Invalid code
            console.log("verify ")
            console.log(error);
            console.log(error.message);

            /* hide the current content and return success */
            document.getElementById("container").style.display = "none";

            /* Make error password message visible */
            document.getElementById("errorMessage").innerHTML = error.message;

             document.getElementById("After-contanier").style.display = "block";
        });

}


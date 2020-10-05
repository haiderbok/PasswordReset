const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const application = express();

application.use(cors());

application.post('/', async(request, response) => {

    const email = request.body.email;
    const password = request.body.password;
    const db = admin.firestore();
    const bcrypt = require('bcrypt');


    try {
        const user = await admin.auth().getUserByEmail(email);
        const listusers = await admin.auth().listUsers();
        console.log(listusers.users)
        const userRecord = await admin.auth().updateUser(user.uid, {
            password
        });
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        db.collection('hashed_password').doc(user.uid).update({
            password: hash
        })
        response.send(user);
    } catch (e) {
        response.send(e);
    }
});

application.post('/encrypt', async(request, response) => {
    const bcrypt = require('bcrypt');
    const password = request.body[0].password
    const oldpasswordhash = request.body[1].oldpasswordhash;


    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        bcrypt.compare(password, oldpasswordhash).then((result) => {
            console.log(result);
            response.send(result);
            return;
        }).catch((error) => {
            console.log(error);
            throw new functions.https.HttpsError('not-found', error.message);
        })
    } catch (e) {
        response.send(e);
    }
}); 


exports.updateUserPassword = functions.https.onRequest(application);




exports.encrypt = functions.https.onRequest( async (request, response) => {

    const bcrypt = require('bcrypt');
    var values = JSON.parse(request.body);

 
    try {
        // const salt = bcrypt.genSaltSync(10);
        // const hash = bcrypt.hashSync(password, salt);
        const result =  await bcrypt.compare(values.password, values.oldpasswordhash);
        response.send({ result })
    } catch (e) {
        response.send(e);
        throw new functions.https.HttpsError('not-found', e.message);
    }


})


exports.addHash = functions.https.onCall(async (data, context) => {
    const bcrypt = require('bcrypt');
    const db = admin.firestore();
    // console.log(data.data.password);
    // console.log (data.data.email);

    // return `here : ${data}`

    let email = data.email;
    let password = data.password;
    console.log(data);
    console.log(email);
    console.log(password);

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(data.password, salt);
        const user = await admin.auth().getUserByEmail(data.email);
        await db.collection("hashed_password").doc(user.uid).set({
            email : email,
            password: hash
        }).then(() => {
            return {"data" : "succesfull"};
        }).catch((error) => {
            console.log(error);
            throw new functions.https.HttpsError('not-found', error.message);
        });

        return  {
            data
        }

    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError('aborted', error.message);
    }
})

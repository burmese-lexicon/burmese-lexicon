// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors')({ origin: true });
const app = express();
admin.initializeApp(functions.config().firebase);
const COLLECTIONS = {
    CONTRIBUTIONS: 'contributions',
    PUBLIC_USERS: 'public-users'
};
const DEFINITION_SCORE = 3;
const VOTE_SCORE = 1;
// TODO: rewrite these with await
const adminFirestore = admin.firestore();
exports.createPublicUserInfo = functions.auth.user().onCreate(user => {
    console.log('Setting public user info on user creation');
    // yea firebase doesn't include displayName for email signup, so you need to make a call to the db
    return admin.auth().getUser(user.uid)
        .then(fetchedUser => {
        console.log(fetchedUser);
        adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).doc(user.uid).set({
            name: fetchedUser.displayName,
            photoURL: fetchedUser.photoURL || null
        });
    });
});
exports.anonymizePublicUserinfo = functions.auth.user().onDelete(user => {
    console.log('Annoymizing user on delete');
    console.log(user);
    return adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).doc(user.uid).set({
        name: `user${user.uid.substring(user.uid.length - 5, user.uid.length)}`,
        photoURL: null
    });
});
exports.incrementDefContributionOnDefCreate = functions.firestore.document('/definitions/{definition}')
    .onCreate((snap, context) => {
    const user = snap.data().user;
    const contributionsRef = adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS);
    let definitions = 1;
    let score = DEFINITION_SCORE;
    return contributionsRef.doc(user).get()
        .then(contriSnap => {
        if (contriSnap.exists) {
            const contributionData = contriSnap.data();
            definitions = contributionData.definitions + 1;
            score = contributionData.score + DEFINITION_SCORE;
            console.log(`incrementing def contribution for user ${user} to ${score}`);
            contributionsRef.doc(user).set({
                definitions,
                score
            }, { merge: true });
        }
        else {
            adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).doc(user).get().then(snapshot => {
                const username = snapshot.data().name;
                console.log(`incrementing def contribution for user ${user} to ${score}`);
                contributionsRef.doc(user).set({
                    definitions,
                    score,
                    user: username
                });
            });
        }
    });
});
exports.incrementDefContributionOnDefVote = functions.firestore.document('/definitions/{definition}')
    .onUpdate((change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const newVotes = newData.votes;
    const oldVotes = oldData.votes;
    let isNewlyCreatedVote = true;
    if (newVotes) {
        let newVote = 0;
        if (oldVotes) {
            for (let user in newVotes) {
                if (user in oldVotes) {
                    // we need the diff to offset the existing score
                    newVote = newVotes[user] - oldVotes[user];
                    isNewlyCreatedVote = false;
                    break;
                }
            }
        }
        else {
            newVote = newVotes[Object.keys(newVotes)[0]];
        }
        const user = newData.user;
        const contributionsRef = adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS);
        return contributionsRef.doc(user).get()
            .then(contriSnap => {
            const stats = contriSnap.data();
            const votes = stats.votes ? stats.votes + (isNewlyCreatedVote ? 1 : 0) : 1;
            const score = stats.score + (VOTE_SCORE * newVote);
            contributionsRef.doc(user).set({
                score,
                votes
            }, { merge: true });
        });
    }
});
exports.resetContributionScoreOnDefDelete = functions.firestore.document('/definitions/{definition}')
    .onDelete((change, context) => {
    const data = change.data();
    let voteScores = 0;
    if (data.votes) {
        for (let user in data.votes) {
            // reverse the score
            voteScores += -1 * data.votes[user];
        }
    }
    const contributionsRef = adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS);
    return contributionsRef.doc(data.user).get()
        .then(contriSnap => {
        const stats = contriSnap.data();
        const definitions = stats.definitions - 1;
        const votes = stats.votes ? stats.votes - Object.keys(data.votes).length : 0;
        const score = stats.score - DEFINITION_SCORE + (VOTE_SCORE * voteScores);
        contributionsRef.doc(data.user).set({
            score,
            votes,
            definitions
        }, { merge: true });
    });
});
app.use(cors);
app.get('/getTopContributions', (req, res) => {
    adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS)
        .orderBy('score', 'desc')
        .limit(100)
        .get()
        .then(snapshot => {
        const contributions = [];
        snapshot.forEach(doc => contributions.push(doc.data()));
        res.set('Cache-Control', 'max-age=100')
            .send(contributions);
    });
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map
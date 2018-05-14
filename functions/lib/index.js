"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    PUBLIC_USERS: 'public-users',
    USERS: 'users',
    WORD_LIST: 'word-list',
    STATS: 'stats',
    REQUESTED_WORDS: 'requested-words'
};
const DEFINITION_SCORE = 3;
const VOTE_SCORE = 1;
// TODO: rewrite these with await
const adminFirestore = admin.firestore();
exports.updateStatsOnContributionsWrite = functions.firestore.document('/contributions/{contribution}').onWrite((snap, context) => {
    return adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS).get()
        .then(contriSnap => {
        let words = 0;
        let contributors = 0;
        let definitions = 0;
        contriSnap.forEach(cSnap => {
            const data = cSnap.data();
            words += data.words;
            definitions += data.definitions;
            contributors++;
        });
        adminFirestore.collection(COLLECTIONS.STATS).doc('stats').set({
            words,
            contributors,
            definitions
        });
    });
});
exports.onWordsCreate = functions.firestore.document('/words/{word}').onCreate((snap, context) => {
    const word = snap.data().text;
    return adminFirestore.collection(COLLECTIONS.WORD_LIST).doc('static').get()
        .then(listSnap => {
        const words = listSnap.data().words;
        words.push(word);
        adminFirestore.collection(COLLECTIONS.WORD_LIST).doc('static').update({
            words
        });
        console.log(`Updated words list on word create: ${word}`);
        adminFirestore.collection(COLLECTIONS.REQUESTED_WORDS).doc(word).delete()
            .then(() => console.log(`Deleted requested word on word create: ${word}`));
    });
});
exports.onUsersCreate = functions.auth.user().onCreate(user => {
    // yea firebase doesn't include displayName for email signup, so you need to make a call to the db
    return admin.auth().getUser(user.uid)
        .then(fetchedUser => {
        console.log('Setting public user info on user creation');
        adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).doc(user.uid).set({
            name: fetchedUser.displayName,
            photoURL: fetchedUser.photoURL || null
        });
        console.log('Setting user roles on user create');
        adminFirestore.collection(COLLECTIONS.USERS).doc(user.uid).set({
            roles: []
        }, { merge: true });
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
    let words = 1;
    let score = DEFINITION_SCORE;
    return contributionsRef.doc(user).get()
        .then(contriSnap => {
        if (contriSnap.exists) {
            const contributionData = contriSnap.data();
            words = contributionData.words + 1;
            definitions = contributionData.definitions + 1;
            score = contributionData.score + DEFINITION_SCORE;
            console.log(`incrementing def contribution for user ${user} to ${score}`);
            contributionsRef.doc(user).set({
                words,
                definitions,
                score
            }, { merge: true });
        }
        else {
            console.log(`incrementing def contribution for user ${user} to ${score}`);
            adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).get(user)
                .then(publicSnap => {
                const publicUserInfo = publicSnap.data();
                contributionsRef.doc(user).set({
                    words,
                    definitions,
                    score,
                    user,
                    name: publicUserInfo.name,
                    photoURL: publicUserInfo.photoURL
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
exports.onPublicUsersWrite = functions.firestore.document('/public-users/{user}')
    .onWrite((change, context) => {
    const user = context.params.user;
    const info = change.after.data();
    return adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS).doc(user).set({
        name: info.name,
        photoURL: info.photoURL
    }, { merge: true });
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
        const words = stats.words - 1;
        const votes = stats.votes ? stats.votes - Object.keys(data.votes).length : 0;
        const score = stats.score - DEFINITION_SCORE + (VOTE_SCORE * voteScores);
        contributionsRef.doc(data.user).set({
            words,
            score,
            votes,
            definitions
        }, { merge: true });
    });
});
app.use(cors);
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map
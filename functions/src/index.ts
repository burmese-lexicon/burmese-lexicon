// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const COLLECTIONS = {
  CONTRIBUTIONS: 'contributions',
  PUBLIC_USERS: 'public-users'
}
const DEFINITION_SCORE = 3
const VOTE_SCORE = 1

// TODO: rewrite these with await

const adminFirestore = admin.firestore()
exports.incrementDefContribution = functions.firestore.document('/definitions/{definition}')
  .onCreate((snap, context) => {
    const user = snap.data().user
    const contributionsRef = adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS)
    let definitions = 1
    let score = DEFINITION_SCORE
    return contributionsRef.doc(user).get()
      .then(contriSnap => {
        if (contriSnap.exists) {
          const contributionData = contriSnap.data()
          definitions = contributionData.definitions + 1
          score = contributionData.score + DEFINITION_SCORE
          console.log(`incrementing def contribution for user ${user} to ${score}`)
          contributionsRef.doc(user).set({
            definitions,
            score
          }, { merge: true })
        } else {
          adminFirestore.collection(COLLECTIONS.PUBLIC_USERS).doc(user).get().then(snapshot => {
            const username = snapshot.data().name
            console.log(`incrementing def contribution for user ${user} to ${score}`)
            contributionsRef.doc(user).set({
              definitions,
              score,
              user: username
            })
          })
        }
      })
  })

exports.getTopContributions = functions.https.onRequest((req, res) => {
  return adminFirestore.collection(COLLECTIONS.CONTRIBUTIONS)
    .orderBy('score', 'desc')
    .limit(100)
    .get()
    .then(snapshot => {
      const contributions = []
      snapshot.forEach(doc => contributions.push(doc.data()))
      res.set('Cache-Control', 'max-age=100')
        .send(contributions)
    })
})

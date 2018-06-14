#! /usr/bin/node

const Firebase = require('firebase-admin')
const fs = require('fs')
const jsonFile = './mywiktionary.json'
const processedFile = './processed-words.json'
const credentialsPath = process.env.CREDENTIALS || `${process.env.HOME}/burmese-lexicon-dev-private-key.json`
const maxWords = process.env.MAX_WORDS || 30000
const encoding = 'utf8'
const processWords = process.env.PROCESS_WORDS || false
const uploaderId = process.env.NODE_ENV === 'prod' ? 'otn0uuuwrbXW7fvxniFSoNgkK592' : 'itHiaMMkt4NLf81J6gEfVXAD6cj1'

const COLLECTIONS = {
  WORDS: 'words',
  USERS: 'users',
  DEFINITIONS: 'definitions'
}

fs.readFile(jsonFile, encoding, (err, data) => {
  console.log(`reading file ${jsonFile}`)
  if (err) {
    throw err
  }
  let words
  words = processWords ? processData(data) : readProcessedWords()
  uploadWords(words)
})

function processData (data) {
  console.log('processing the wiktionary data dump...')
  const doc = JSON.parse(data)
  const pages = doc.mediawiki.page
  const words = []
  pages.forEach(page => {
    if (isValidBurmeseWordPage(page)) {
      words.push(extractDefsFromPage(page))
    }
  })
  words.sort((a, b) => a.word.localeCompare(b.word))
  fs.writeFile(processedFile, JSON.stringify(words), encoding, err => {
    if (err) {
      throw err
    }
    console.log(`saved ${words.length} processed words to ${processedFile}`)
  })
  return words
}

function readProcessedWords () {
  try {
    const data = fs.readFileSync(processedFile, encoding)
    return JSON.parse(data)
  } catch (e) {
    console.error(`error reading ${processedFile}`)
  }
}

async function uploadWords (words) {
  const adminFirestore = getFirebaseApp().firestore()
  const createdAt = Date.now()
  const numWords = Math.min(maxWords, words.length)
  console.log('uploading words to firestore...')
  for (let i = 0; i < numWords; i++) {
    const word = words[i]
    try {
      const wordSnap = await adminFirestore.collection(COLLECTIONS.WORDS).doc(word.word).get()
      if (!wordSnap.exists) {
        await adminFirestore.collection(COLLECTIONS.WORDS).doc(word.word).set({
          createdAt,
          text: word.word,
          user: uploaderId
        })
      }
      adminFirestore.collection(COLLECTIONS.DEFINITIONS).doc(`${uploaderId}-${word.word}`).set({
        user: uploaderId,
        createdAt,
        text: word.def,
        word: word.word
      })
      if (i === numWords) {
        console.log(`uploaded ${numWords} words to firestore`)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

function getFirebaseApp () {
  try {
    console.log(`reading firebase admin credentials from ${credentialsPath}`)
    const credentialsBuffer = fs.readFileSync(credentialsPath)
    const credentials = JSON.parse(credentialsBuffer.toString())
    return Firebase.initializeApp(
      {
        credential: Firebase.credential.cert(credentials)
      },
      credentialsPath
    )
  } catch (error) {
    console.log(`Unable to read: ${credentialsPath}: ${error}`)
    throw error
  }
}

function isValidBurmeseWordPage (page) {
  return /^[\u1000-\u109F ]*$/.test(page.title) && pageHasDefinition(page)
}

function pageHasDefinition (page) {
  return /current/.test(page.revision.text)
}

function extractDefsFromPage (page) {
  const title = page.title
  const text = page.revision.text
  const lines = text.split('\n')
  let defString = '<ol>'
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (line === '* current') { // current section has burmese definition
      i += 2 // skip two lines because current is a subtitle
      line = lines[i]
      while (line.startsWith('#')) {
        if (line.startsWith('#:')) { // example line
          defString += `<em>${line}</em>`
        } else {
          defString += `<li>${line}</li>`
        }
        line = lines[++i]
      }
    }
    if (line === '====အင်္ဂလိပ်====') {
      defString += `<li>${lines[++i].replace(/\*\s?/, '')}</li>`
    }
  }
  defString += `</ol><p><a href='https://my.wiktionary.org/wiki/${title}' target='_blank'>မြန်မာဝစ်ရှင်နရီ</a></p>`
  return {
    word: title,
    def: defString.replace(/#:?\s?/g, '')
  }
}

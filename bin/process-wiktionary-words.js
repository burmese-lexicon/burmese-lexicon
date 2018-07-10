#! /usr/bin/node

/*
 Usage:
  auto increment import:
    WORDS_OFFSET=$(cat offset) WORDS_INCREMENT=50 MAX_WORDS=1000 AUTO_IMPORT=true NODE_ENV=prod ./process-wiktionary-words.js
  process raw words into word+def objects
    PROCESS_WORDS=true ./process-wiktionary-words.js
*/

const Firebase = require('firebase-admin')
const fs = require('fs')
const jsonFile = './mywiktionary.json'
const processedFile = './processed-words.json'
const isProd = process.env.NODE_ENV === 'prod'
const credentialsPath = `${process.env.HOME}/burmese-lexicon${isProd ? '' : '-dev'}-private-key.json`
const autoIncrementalImport = process.env.AUTO_IMPORT
const wordsIncrement = Number.parseInt(process.env.WORDS_INCREMENT) || 25
const maxWords = Number.parseInt(process.env.MAX_WORDS) || 1000
const sleepTime = Number.parseInt(process.env.SLEEP_TIME) || 300000 // g cloud functions rate limit
let wordsOffset = Number.parseInt(process.env.WORDS_OFFSET) || 0
const offsetFile = './offset'
const encoding = 'utf8'
const processWords = process.env.PROCESS_WORDS || false
const stopOnError = process.env.STOP_ON_ERROR || true
const mergeDefs = process.env.MERGE_DEF || false
const uploaderId = isProd ? 'otn0uuuwrbXW7fvxniFSoNgkK592' : 'itHiaMMkt4NLf81J6gEfVXAD6cj1'
let startTime = Date.now()

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
  let words = processWords ? processData(data) : readProcessedWords()
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
  const numWords = Math.min(wordsIncrement, words.length)
  let totalWords = 0
  console.log(`uploading words to ${isProd ? 'prod' : 'dev'} firestore...`)
  do {
    console.log('--------------------------------------------------------')
    console.log(`words increment: ${wordsIncrement},  offset: ${wordsOffset}, max: ${maxWords}`)
    const uploadPromises = []
    for (let i = wordsOffset, count = 0; i < words.length && count <= numWords; i++, count++) {
      uploadPromises.push(uploadWord(words[i], adminFirestore, createdAt))
    }
    try {
	    await Promise.all(uploadPromises)
    } catch (e) {
      console.error(e)
      console.error('uploading failed exiting...')
      return
    }
    console.log(`uploaded ${numWords} words to firestore`)
    console.log(`done in ${(Date.now() - startTime) / 1000}s`)
    wordsOffset += wordsIncrement
    totalWords += wordsIncrement
    if (autoIncrementalImport) {
      console.log(`sleeping for ${sleepTime / 1000}s`)
      console.log(`uploaded ${totalWords} words! next start offset is ${wordsOffset}`)
      fs.writeFileSync(offsetFile, wordsOffset, encoding)
      await sleep(sleepTime) // avoid overwhelming firestore rate limit
    }
  } while (autoIncrementalImport && totalWords < maxWords && wordsOffset < words.length)
}

async function uploadWord (word, adminFirestore, createdAt) {
  try {
    const wordSnap = await adminFirestore.collection(COLLECTIONS.WORDS).doc(word.word).get()
    if (wordSnap.exists && !mergeDefs) {
      return
    }
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
    console.log(`uploaded ${word.word}`)
  } catch (e) {
    console.error(e)
    if (stopOnError) {
      throw new Error(`failed on upload word: ${word}`)
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

function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

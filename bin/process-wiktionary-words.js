#! /usr/bin/node

const fs = require('fs')
const jsonFile = './mywiktionary.json'
const processedFile = './processed-words.json'
const encoding = 'utf8'

fs.readFile(jsonFile, encoding, (err, data) => {
  console.log(`reading file ${jsonFile}`)
  if (err) {
    throw err
  }
  processData(data)
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
  defString += `</ol><p><a href='https://my.wiktionary.org/wiki/${title}'>မြန်မာဝစ်ရှင်နရီ</a></p>`
  return {
    word: title,
    def: defString.replace(/#:?\s?/g, '')
  }
}

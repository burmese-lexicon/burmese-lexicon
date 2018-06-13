#! /usr/bin/node

// wget from https://dumps.wikimedia.org/mywiki/20180601/, extract xml, convert to json and process

const fs = require('fs')
const parser = require('fast-xml-parser')
const xmlFile = './mywiktionary.xml'
const jsonFile = './mywiktionary.json'
const encoding = 'utf8'

fs.readFile(xmlFile, encoding, (err, data) => {
  console.log(`reading file ${xmlFile}`)
  if (err) {
    throw err
  }
  writeAsJson(data)
})

function writeAsJson (xmlString) {
  console.log('processing the xml string...')
  const doc = parser.parse(xmlString)
  const docString = JSON.stringify(doc)
  fs.writeFile(jsonFile, docString, encoding, err => {
    if (err) {
      throw err
    }
    console.log(`json saved to ${jsonFile}`)
  })
}

function doGet() {
  const iconUrl = 'https://icons.iconarchive.com/icons/marcus-roberto/google-play/512/Google-Translate-icon.png'
  return HtmlService.createTemplateFromFile('index').evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('Ads Translator')
    .setFaviconUrl(iconUrl)
} 

function includeExternalFile(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent()
}

function __translateAds(texts, languages, original_language) {
  if(texts.error != false) {
    return { url: "", translations: "got error", error: texts.error}
  }
  const publicGDriveFolder = "1YUtsZWk-VAq8Po3CFiVHnsbK94onINYA"
  var translations = []

  texts.data.forEach(text => {
    const translation = {
      original_text: text,
      translates: []
    }

    languages.forEach(language => {
      translation.translates.push({
        language: language,
        text: LanguageApp.translate(text, original_language, language)
      })
    })

    translations.push(translation)
  })

  const url = pasteTranslations(translations, publicGDriveFolder)

  return { url: url, translations: translations, error: "none"}
}

// # # # # # # # # # # # # # # # # # # 

function getLanguages() {
  const languages_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Languages");
  const last_row = languages_sheet.getLastRow()
  const language_names = languages_sheet.getRange(2,1,last_row-1,1).getValues()
  const language_codes = languages_sheet.getRange(2,2,last_row-1,1).getValues()
  
  let languages = []
  for(var i = 0; i < language_names.length; i++){
    languages.push({
      language: language_names[i][0],
      code: language_codes[i][0],
    })
  }
  return languages
}

function getTexts(original_text_spreadsheet_url) {
  let sheet
  try {
    sheet = SpreadsheetApp.openByUrl(original_text_spreadsheet_url).getSheets()[0];
  } catch (e) {
    return {data: [], error: "Incorrect texts spreadsheet URL"}
  }
  
  const last_row = sheet.getLastRow()
  if(last_row == 0) {
    return {data: [], error: "No texts on current spreadsheet"}
  }

  let texts = []
  sheet.getRange(1,1,last_row,1).getValues().forEach(row => {
    texts.push(row[0])
  })
  if(texts.length == 0) {
    return {data: [], error: "No texts on current spreadsheet"}
  }

  return {data: texts, error: false}
}

function pasteTranslations(translations, publicGDriveFolder) {
  const translation_sheet = createReportBlank()
  moveToPublicFolder(translation_sheet, publicGDriveFolder)
  const list = translation_sheet.getSheets()[0]
  list.getRange(1,1).setValue("works")

  var data = []
  translations.forEach(translation => {
    data.push(["original", translation.original_text])
    translation.translates.forEach(language => {
      data.push([language.language, language.text])
    })
    data.push(["",""])
  })
  list.getRange(1,1,data.length,2).setValues(data)

  return translation_sheet.getUrl()
}

function moveToPublicFolder(doc, dir) {
  var file = DriveApp.getFileById(doc.getId());
  var folder = DriveApp.getFolderById(dir);
  file.moveTo(folder);
  return true
}

function createReportBlank() {
  const date = new Date()
  const doc = SpreadsheetApp.create(`${date.getDate()}.${date.getMonth() + 1} | Ads Translation`);
  doc.getSheets()[0].setName("Main List");
  return doc
}

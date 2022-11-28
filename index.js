  // Main button
  document.getElementById("translate-button").addEventListener('click', () => {
    const original_text_spreadsheet_url = document.getElementById("original-text-spreadsheet-url").value
    const languages = getSelectedLanguages()
    const original_language = getOriginalLanguage()
    google.script.run
      .withSuccessHandler((texts) => {
        console.log(texts)
        google.script.run.withSuccessHandler(displayTranslation)
            .__translateAds(texts, languages, original_language)
      })
      .getTexts(original_text_spreadsheet_url)        
  })

  function displayTranslation(res){
    console.log(res.translations)
    document.getElementById('open-translate-button').addEventListener('click', () => {
      document.getElementById('open-translate-button').disabled = true;
      parent.open(res.url)
    })
    document.getElementById("open-translate-button").classList.remove('btn-secondary');
    document.getElementById("open-translate-button").classList.add('btn-primary');
    document.getElementById('loading-animation').style.display = "none"
    document.getElementById('translate-created').style.display = "inline"
    document.getElementById('open-translate-button').disabled = false;
    if(res.error != false) {
      console.log(res.error)
      document.getElementById("processing-errors-translate").innerHTML = (`<b>Processing errors:</b><br>${res.error}`)
    }
  }

  // Tamplate button
  document.getElementById('open-spreadsheet-template').addEventListener('click', () => {
    parent.open("https://docs.google.com/spreadsheets/d/1OBndoaBcL1GZIr0nl_n0LJC2eAQ6kTy2NXZx8y5JJQw/edit?usp=sharing")
  })

  // Get settings
  function getSelectedLanguages() {
    var selected = []
    $('#translation-language-checkboxes-list input:checked').each(function() {
        selected.push($(this).attr('value'));
    })
    return selected
  }

  function getOriginalLanguage() {
    let selected
    $('#original-language-checkboxes-list input:checked').each(function() {
        selected = $(this).attr('value')
    })
    return selected
  }

  // Loads languages from core spreadsheet
  $(function() {
    google.script.run.withSuccessHandler(addLanguages)
        .getLanguages()
  });

  // Sets radio for "original language" and checkbox for "translate languages"
  function addLanguages(languages) {
    var list_original = $('#original-language-checkboxes-list');
    list_original.empty()
    for (var i = 0; i < languages.length; i++) {
      
      // Original language English as a default
      if (languages[i].code == "en") {
        list_original.append(
          `<li><input checked="true" class="original-language-radio" type="radio" id="cb-r${i}" value="${languages[i].code}" /><label for="cb-r${i}">${languages[i].language}</label></li> `
        );
      } else {
        list_original.append(
          `<li><input class="original-language-radio" type="radio" id="cb-r${i}" value="${languages[i].code}" /><label for="cb-r${i}">${languages[i].language}</label></li> `
        );
      }
    }

    var list_translation = $('#translation-language-checkboxes-list');
    list_translation.empty()
    for (var i = 0; i < languages.length; i++) {
      list_translation.append(`<li><input type="checkbox" id="cb${i}" value="${languages[i].code}" /><label for="cb${i}">${languages[i].language}</label></li> `);
    }

    // Two original languages can't be checked in one time
    document.querySelectorAll('.original-language-radio').forEach(item => {
      item.addEventListener('click', event => {
        document.querySelectorAll('.original-language-radio').forEach(item => { item.checked = false })
        item.checked = true
      })
    })
  }

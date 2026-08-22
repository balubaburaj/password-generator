document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Management ---
  const themeToggle = document.getElementById("themeToggle");
  
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem("passwordGeneratorTheme") || "light";
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("passwordGeneratorTheme", newTheme);
    });
  }

  // DOM Elements
  const lengthSelect = document.getElementById("length");
  const quantitySelect = document.getElementById("quantity");
  const includeNumbers = document.getElementById("includeNumbers");
  const includeLowercase = document.getElementById("includeLowercase");
  const includeUppercase = document.getElementById("includeUppercase");
  const beginWithLetter = document.getElementById("beginWithLetter");
  const includeSymbols = document.getElementById("includeSymbols");
  const symbolsInput = document.getElementById("symbols");
  const includeSimpleSymbols = document.getElementById("includeSimpleSymbols");
  const simpleSymbolsInput = document.getElementById("simpleSymbols");
  const noSimilar = document.getElementById("noSimilar");
  const noDuplicates = document.getElementById("noDuplicates");
  const noSequential = document.getElementById("noSequential");
  const autoGenerate = document.getElementById("autoGenerate");
  const savePreference = document.getElementById("savePreference");
  const resetButton = document.getElementById("reset");
  const generateButton = document.getElementById("generate");
  const copyFirstButton = document.getElementById("copyFirst");
  const copyAllButton = document.getElementById("copyAll");
  const passwordsContainer = document.getElementById("passwords-container");
  const maxUniqueCharsSpan = document.getElementById("max-unique-chars");
  let duplicateFallbackTriggered = false;

  const defaults = {
    length: 22,
    quantity: 5,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    beginWithLetter: true,
    includeSymbols: true,
    symbols: "!*#$%&()*+,-./:;<=>?@[]^_{|}~",
    includeSimpleSymbols: false,
    simpleSymbols: "#$",
    noSimilar: true,
    noDuplicates: true,
    noSequential: true,
    autoGenerate: true,
    savePreference: false,
  };

  const lengthOptions = document.getElementById("length-options");
  // Populate dropdowns
  for (let i = 6; i <= 50; i++) {
    const option = document.createElement("option");
    option.value = i;
    lengthOptions.appendChild(option);
  }
  for (let i = 5; i <= 100; i += 5) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    quantitySelect.appendChild(option);
  }
  for (let i = 110; i <= 500; i += 10) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    quantitySelect.appendChild(option);
  }

  // --- Preference Management ---
  function saveSettings() {
    if (savePreference.checked) {
      const settings = {
        length: lengthSelect.value,
        quantity: quantitySelect.value,
        includeNumbers: includeNumbers.checked,
        includeLowercase: includeLowercase.checked,
        includeUppercase: includeUppercase.checked,
        beginWithLetter: beginWithLetter.checked,
        includeSymbols: includeSymbols.checked,
        symbols: symbolsInput.value,
        includeSimpleSymbols: includeSimpleSymbols.checked,
        simpleSymbols: simpleSymbolsInput.value,
        noSimilar: noSimilar.checked,
        noDuplicates: noDuplicates.checked,
        noSequential: noSequential.checked,
        autoGenerate: autoGenerate.checked,
        savePreference: savePreference.checked,
      };
      localStorage.setItem(
        "passwordGeneratorSettings",
        JSON.stringify(settings),
      );
    } else {
      localStorage.removeItem("passwordGeneratorSettings");
    }
  }

  function loadSettings() {
    const savedSettings = localStorage.getItem("passwordGeneratorSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setUIValues(settings);
    } else {
      setUIValues(defaults);
    }
  }

  function setUIValues(settings) {
    lengthSelect.value = settings.length;
    quantitySelect.value = settings.quantity;
    includeNumbers.checked = settings.includeNumbers;
    includeLowercase.checked = settings.includeLowercase;
    includeUppercase.checked = settings.includeUppercase;
    beginWithLetter.checked = settings.beginWithLetter;
    includeSymbols.checked = settings.includeSymbols;
    symbolsInput.value = settings.symbols;
    includeSimpleSymbols.checked = settings.includeSimpleSymbols;
    simpleSymbolsInput.value = settings.simpleSymbols;
    noSimilar.checked = settings.noSimilar;
    noDuplicates.checked = settings.noDuplicates;
    noSequential.checked = settings.noSequential;
    autoGenerate.checked = settings.autoGenerate;
    savePreference.checked = settings.savePreference;
  }

  includeSymbols.addEventListener("change", () => {
    if (includeSymbols.checked) {
      includeSimpleSymbols.checked = false;
    }
  });

  includeSimpleSymbols.addEventListener("change", () => {
    if (includeSimpleSymbols.checked) {
      includeSymbols.checked = false;
    }
  });

  resetButton.addEventListener("click", () => {
    setUIValues(defaults);
    saveSettings();
  });

  // --- Password Generation Logic ---

  // Helper for Fisher-Yates shuffle
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const arrayBuffer = new Uint32Array(1);
      crypto.getRandomValues(arrayBuffer);
      const j = arrayBuffer[0] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generatePassword() {
    const length = parseInt(lengthSelect.value);
    const similarChars = /[il1Lo0O]/g;

    const charSets = {
      numbers: "0123456789",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      symbols: symbolsInput.value,
      simpleSymbols: simpleSymbolsInput.value,
    };

    if (noSimilar.checked) {
      for (let key in charSets) {
        charSets[key] = charSets[key].replace(similarChars, "");
      }
    }

    let activeSets = [];
    if (includeNumbers.checked) activeSets.push(charSets.numbers);
    if (includeLowercase.checked) activeSets.push(charSets.lowercase);
    if (includeUppercase.checked) activeSets.push(charSets.uppercase);
    if (includeSymbols.checked && charSets.symbols) activeSets.push(charSets.symbols);
    if (includeSimpleSymbols.checked && charSets.simpleSymbols) activeSets.push(charSets.simpleSymbols);

    if (activeSets.length === 0 || activeSets.every(set => set === "")) {
      return "ERROR_NO_CHARSET";
    }

    let fullCharset = activeSets.join("");

    let useNoDuplicates = noDuplicates.checked;
    if (useNoDuplicates && fullCharset.length < length) {
      // Graceful fallback: if impossible to have all unique chars, allow duplicates
      useNoDuplicates = false;
      duplicateFallbackTriggered = true;
    }

    let attempts = 0;
    while (attempts < 100) {
      let passwordArray = [];
      let tempCharset = fullCharset;

      // 1. Guaranteed Inclusion: pick one from each selected set
      for (let charSet of activeSets) {
        if (charSet.length > 0) {
          let validChars = charSet;
          if (useNoDuplicates) {
            validChars = validChars.split('').filter(c => tempCharset.includes(c)).join('');
          }
          if (validChars.length > 0) {
            let char = getRandomChar(validChars);
            passwordArray.push(char);
            if (useNoDuplicates) {
              tempCharset = tempCharset.replace(char, "");
            }
          }
        }
      }

      // 2. Fill the remaining characters
      while (passwordArray.length < length) {
        if (tempCharset.length === 0) break;
        let char = getRandomChar(tempCharset);
        passwordArray.push(char);
        if (useNoDuplicates) {
          tempCharset = tempCharset.replace(char, "");
        }
      }

      // 3. Unbiased Shuffle (Fisher-Yates)
      passwordArray = shuffleArray(passwordArray);

      // 4. Enforce Begin With Letter
      if (beginWithLetter.checked) {
        let letterCharset = charSets.lowercase + charSets.uppercase;
        let letterIndex = passwordArray.findIndex(char => letterCharset.includes(char));
        if (letterIndex !== -1) {
          let letter = passwordArray.splice(letterIndex, 1)[0];
          passwordArray.unshift(letter);
        }
      }

      let password = passwordArray.join("");

      // 5. Sequential check validation
      if (noSequential.checked && hasSequentialChars(password)) {
        attempts++;
        continue;
      }
      
      return password;
    }

    console.warn("Could not generate a valid password after 100 attempts. Check constraints.");
    return null;
  }

  function getRandomChar(str) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return str[array[0] % str.length];
  }

  function hasSequentialChars(str) {
    for (let i = 0; i < str.length - 2; i++) {
      const c1 = str.charCodeAt(i);
      const c2 = str.charCodeAt(i + 1);
      const c3 = str.charCodeAt(i + 2);
      if (c1 + 1 === c2 && c2 + 1 === c3) return true;
      if (c1 - 1 === c2 && c2 - 1 === c3) return true;
    }
    return false;
  }

  // --- UI Event Handlers ---
  function displayPasswords() {
    passwordsContainer.innerHTML = "";
    duplicateFallbackTriggered = false;
    const quantity = parseInt(quantitySelect.value);
    let generatedCount = 0;

    for (let i = 0; i < quantity; i++) {
      const password = generatePassword();
      if (password === "ERROR_NO_CHARSET") {
        if (i === 0) alert("Please select at least one character type or add more symbols.");
        break; // Stop generating
      }
      if (password) {
        generatedCount++;
        const div = document.createElement("div");
        div.className = "password-item";

        // Create a non-selectable span for the number
        const numSpan = document.createElement("span");
        numSpan.className = "password-number";
        numSpan.textContent = `${generatedCount}.`;

        // Create a selectable input for the password
        const passInput = document.createElement("input");
        passInput.type = "text";
        passInput.className = "password-text";
        passInput.value = password;
        passInput.readOnly = true;
        // Adjust width based on string length, add 24px for padding
        passInput.style.width = `calc(${password.length}ch + 24px)`;

        // Auto-select text on click
        passInput.addEventListener("click", () => {
          passInput.select();
        });
        
        // Create an individual copy button
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Copy";
        copyBtn.addEventListener("click", () => {
          navigator.clipboard
            .writeText(password)
            .then(() => successCopyAlert("Successfully copied password!"));
        });

        div.appendChild(numSpan);
        div.appendChild(passInput);
        div.appendChild(copyBtn);
        passwordsContainer.appendChild(div);
      }
    }
    const warningEl = document.getElementById("fallback-warning");
    if (warningEl) {
      warningEl.style.display = duplicateFallbackTriggered ? "block" : "none";
    }
    if (generatedCount > 0) saveSettings();
  }

  function updateMaxUniqueChars() {
    const similarChars = /[il1Lo0O]/g;
    const charSets = {
      numbers: "0123456789",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      symbols: symbolsInput.value,
      simpleSymbols: simpleSymbolsInput.value,
    };

    if (noSimilar.checked) {
      for (let key in charSets) {
        charSets[key] = charSets[key].replace(similarChars, "");
      }
    }

    let activeSets = [];
    if (includeNumbers.checked) activeSets.push(charSets.numbers);
    if (includeLowercase.checked) activeSets.push(charSets.lowercase);
    if (includeUppercase.checked) activeSets.push(charSets.uppercase);
    if (includeSymbols.checked && charSets.symbols) activeSets.push(charSets.symbols);
    if (includeSimpleSymbols.checked && charSets.simpleSymbols) activeSets.push(charSets.simpleSymbols);

    let fullCharset = activeSets.join("");
    let uniqueChars = new Set(fullCharset.split(""));
    
    if (maxUniqueCharsSpan) {
      maxUniqueCharsSpan.textContent = uniqueChars.size;
    }
  }

  // --- Visual Feedback for Settings Changes ---
  const allInputs = document.querySelectorAll('.container input, .container select');
  allInputs.forEach(input => {
    input.addEventListener('change', () => {
      generateButton.classList.add('btn-attention');
      updateMaxUniqueChars();
    });
    input.addEventListener('input', () => {
      generateButton.classList.add('btn-attention');
      updateMaxUniqueChars();
    });
  });

  generateButton.addEventListener("click", () => {
    generateButton.classList.remove('btn-attention');
    displayPasswords();
  });

  copyFirstButton.addEventListener("click", () => {
    const firstPassword = passwordsContainer.querySelector(".password-text");
    if (firstPassword) {
      navigator.clipboard
        .writeText(firstPassword.value)
        .then(() => successCopyAlert("Successfully copied first password!"));
    }
  });

  copyAllButton.addEventListener("click", () => {
    let allPasswords = "";
    passwordsContainer.querySelectorAll(".password-text").forEach((item) => {
      allPasswords += item.value + "\n";
    });
    if (allPasswords) {
      navigator.clipboard
        .writeText(allPasswords.trimEnd())
        .then(() => successCopyAlertAll());
    }
  });

  // Initial Load
  loadSettings();
  updateMaxUniqueChars();
  if (autoGenerate.checked) {
    displayPasswords();
  }
});

function successCopyAlert(msg) {
  const snackbar = document.getElementById("snackbar");
  if (msg) {
    snackbar.textContent = msg;
  } else {
    snackbar.textContent = "Successfully copied";
  }
  snackbar.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}
function successCopyAlertAll() {
  var x = document.getElementById("snackbar-all");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

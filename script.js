document.addEventListener("DOMContentLoaded", () => {
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

  // Populate dropdowns
  for (let i = 6; i <= 50; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    lengthSelect.appendChild(option);
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

  resetButton.addEventListener("click", () => {
    setUIValues(defaults);
    saveSettings();
  });

  // --- Password Generation Logic ---
  function generatePassword() {
    const length = parseInt(lengthSelect.value);
    let charset = "";
    let guaranteedChars = [];

    const numbers = "0123456789";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const symbols = symbolsInput.value;
    const simpleSymbols = simpleSymbolsInput.value;
    const similarChars = /[il1Lo0O]/g;

    let initialCharset = "";
    if (includeNumbers.checked) initialCharset += numbers;
    if (includeLowercase.checked) initialCharset += lowercase;
    if (includeUppercase.checked) initialCharset += uppercase;
    if (includeSymbols.checked) initialCharset += symbols;
    if (includeSimpleSymbols.checked) initialCharset += simpleSymbols;

    if (noSimilar.checked) {
      charset = initialCharset.replace(similarChars, "");
    } else {
      charset = initialCharset;
    }

    if (charset === "") {
      alert("Please select at least one character type or add more symbols.");
      return null;
    }

    // Ensure we have enough unique characters if noDuplicates is checked
    if (noDuplicates.checked && charset.length < length) {
      alert(
        "Not enough unique characters available for the selected length. Please adjust your settings.",
      );
      return null;
    }

    let password;
    let attempts = 0;

    while (attempts < 100) {
      // Safety break to prevent infinite loops
      password = "";
      let tempCharset = charset;

      if (beginWithLetter.checked) {
        let letterCharset = lowercase + uppercase;
        if (noSimilar.checked) {
          letterCharset = letterCharset.replace(similarChars, "");
        }
        if (letterCharset.length > 0) {
          const firstChar = getRandomChar(letterCharset);
          password += firstChar;
          if (noDuplicates.checked) {
            tempCharset = tempCharset.replace(firstChar, "");
          }
        }
      }

      for (let i = password.length; i < length; i++) {
        let randomChar = getRandomChar(tempCharset);
        password += randomChar;
        if (noDuplicates.checked) {
          tempCharset = tempCharset.replace(randomChar, "");
        }
      }

      // Shuffle the password to make it more random
      password = password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");

      // Validate against constraints
      if (noSequential.checked && hasSequentialChars(password)) {
        attempts++;
        continue;
      }
      if (!meetsGuaranteedChars(password)) {
        attempts++;
        continue;
      }

      return password;
    }
    // If it fails after 100 attempts, return null
    console.warn(
      "Could not generate a valid password after 100 attempts. Check constraints.",
    );
    return null;
  }

  function meetsGuaranteedChars(password) {
    if (includeNumbers.checked && !/[0-9]/.test(password)) return false;
    if (includeLowercase.checked && !/[a-z]/.test(password)) return false;
    if (includeUppercase.checked && !/[A-Z]/.test(password)) return false;
    if (
      includeSymbols.checked &&
      !new RegExp(
        `[${symbolsInput.value.replace(
          /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\'\"]/g,
          "\\$&",
        )}]`,
      ).test(password)
    )
      return false;
    if (
      includeSimpleSymbols.checked &&
      !new RegExp(
        `[${simpleSymbolsInput.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\'\"]/g, "\\$&")}]`,
      ).test(password)
    )
      return false;
    return true;
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
    }
    return false;
  }

  // --- UI Event Handlers ---
  function displayPasswords() {
    passwordsContainer.innerHTML = "";
    const quantity = parseInt(quantitySelect.value);
    let generatedCount = 0;

    for (let i = 0; i < quantity; i++) {
      const password = generatePassword();
      if (password) {
        generatedCount++;
        const div = document.createElement("div");
        div.className = "password-item";

        // Create a non-selectable span for the number
        const numSpan = document.createElement("span");
        numSpan.className = "password-number";
        numSpan.textContent = `${generatedCount}.`;

        // Create a selectable span for the password
        const passSpan = document.createElement("span");
        passSpan.className = "password-text";
        passSpan.textContent = ` ${password}`;

        div.appendChild(numSpan);
        div.appendChild(passSpan);
        passwordsContainer.appendChild(div);
      }
    }
    if (generatedCount > 0) saveSettings();
  }

  generateButton.addEventListener("click", displayPasswords);

  copyFirstButton.addEventListener("click", () => {
    const firstPassword = passwordsContainer.querySelector(".password-text");
    if (firstPassword) {
      navigator.clipboard
        .writeText(firstPassword.textContent.trim())
        .then(() => successCopyAlert());
    }
  });

  copyAllButton.addEventListener("click", () => {
    let allPasswords = "";
    passwordsContainer.querySelectorAll(".password-text").forEach((item) => {
      allPasswords += item.textContent.trim() + "\n";
    });
    if (allPasswords) {
      navigator.clipboard
        .writeText(allPasswords)
        .then(() => successCopyAlertAll());
    }
  });

  // Initial Load
  loadSettings();
  if (autoGenerate.checked) {
    displayPasswords();
  }
});

function successCopyAlert() {
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
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

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const passwordLengthSelect = document.getElementById("passwordLength");
  const includeNumbersCheckbox = document.getElementById("includeNumbers");
  const includeLowercaseCheckbox = document.getElementById("includeLowercase");
  const includeUppercaseCheckbox = document.getElementById("includeUppercase");
  const beginWithLetterCheckbox = document.getElementById("beginWithLetter");
  const includeSymbolsCheckbox = document.getElementById("includeSymbols");
  const symbolsInput = document.getElementById("symbolsInput");
  const noSimilarCharactersCheckbox = document.getElementById(
    "noSimilarCharacters"
  );
  const noDuplicateCharactersCheckbox = document.getElementById(
    "noDuplicateCharacters"
  );
  const noSequentialCharactersCheckbox = document.getElementById(
    "noSequentialCharacters"
  );
  const autoGenerateCheckbox = document.getElementById("autoGenerate");
  const quantitySelect = document.getElementById("quantity");
  const saveMyPreferenceCheckbox = document.getElementById("saveMyPreference");
  const resetButton = document.getElementById("resetButton");
  const generateButton = document.getElementById("generateButton");
  const copyFirstLineButton = document.getElementById("copyFirstLineButton");
  const copyAllButton = document.getElementById("copyAllButton");
  const passwordList = document.getElementById("passwordList");

  // --- Default Settings ---
  const defaultSettings = {
    passwordLength: 22,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    beginWithLetter: true,
    includeSymbols: true,
    symbols: "!*&#$%&()'\"+,-./:;<=>?@[]^_`{|}~",
    noSimilarCharacters: true,
    noDuplicateCharacters: true,
    noSequentialCharacters: true,
    autoGenerate: true,
    quantity: 5,
  };

  // --- Character Sets ---
  const charSets = {
    numbers: "0123456789",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    similar: "il1LO0", // Characters to avoid for 'no similar characters'
  };

  // --- Helper Functions ---

  // Populate dropdowns (password length and quantity)
  function populateDropdowns() {
    for (let i = 6; i <= 50; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      passwordLengthSelect.appendChild(option);
    }
    for (let i = 5; i <= 500; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      quantitySelect.appendChild(option);
    }
  }

  // Load settings from localStorage
  function loadSettings() {
    const savedSettings = localStorage.getItem("passwordGeneratorSettings");
    if (savedSettings && saveMyPreferenceCheckbox.checked) {
      const settings = JSON.parse(savedSettings);
      passwordLengthSelect.value = settings.passwordLength;
      includeNumbersCheckbox.checked = settings.includeNumbers;
      includeLowercaseCheckbox.checked = settings.includeLowercase;
      includeUppercaseCheckbox.checked = settings.includeUppercase;
      beginWithLetterCheckbox.checked = settings.beginWithLetter;
      includeSymbolsCheckbox.checked = settings.includeSymbols;
      symbolsInput.value = settings.symbols;
      noSimilarCharactersCheckbox.checked = settings.noSimilarCharacters;
      noDuplicateCharactersCheckbox.checked = settings.noDuplicateCharacters;
      noSequentialCharactersCheckbox.checked = settings.noSequentialCharacters;
      autoGenerateCheckbox.checked = settings.autoGenerate;
      quantitySelect.value = settings.quantity;
      // saveMyPreferenceCheckbox.checked status is handled by initSettings
    } else {
      // Apply default settings if no saved settings or checkbox is unchecked
      applySettings(defaultSettings);
    }
  }

  // Save settings to localStorage
  function saveSettings() {
    if (saveMyPreferenceCheckbox.checked) {
      const settings = {
        passwordLength: parseInt(passwordLengthSelect.value),
        includeNumbers: includeNumbersCheckbox.checked,
        includeLowercase: includeLowercaseCheckbox.checked,
        includeUppercase: includeUppercaseCheckbox.checked,
        beginWithLetter: beginWithLetterCheckbox.checked,
        includeSymbols: includeSymbolsCheckbox.checked,
        symbols: symbolsInput.value,
        noSimilarCharacters: noSimilarCharactersCheckbox.checked,
        noDuplicateCharacters: noDuplicateCharactersCheckbox.checked,
        noSequentialCharacters: noSequentialCharactersCheckbox.checked,
        autoGenerate: autoGenerateCheckbox.checked,
        quantity: parseInt(quantitySelect.value),
      };
      localStorage.setItem(
        "passwordGeneratorSettings",
        JSON.stringify(settings)
      );
    } else {
      localStorage.removeItem("passwordGeneratorSettings"); // Clear if preference is unchecked
    }
  }

  // Apply given settings to the UI
  function applySettings(settings) {
    passwordLengthSelect.value = settings.passwordLength;
    includeNumbersCheckbox.checked = settings.includeNumbers;
    includeLowercaseCheckbox.checked = settings.includeLowercase;
    includeUppercaseCheckbox.checked = settings.includeUppercase;
    beginWithLetterCheckbox.checked = settings.beginWithLetter;
    includeSymbolsCheckbox.checked = settings.includeSymbols;
    symbolsInput.value = settings.symbols;
    noSimilarCharactersCheckbox.checked = settings.noSimilarCharacters;
    noDuplicateCharactersCheckbox.checked = settings.noDuplicateCharacters;
    noSequentialCharactersCheckbox.checked = settings.noSequentialCharacters;
    autoGenerateCheckbox.checked = settings.autoGenerate;
    quantitySelect.value = settings.quantity;
    // The saveMyPreference checkbox's state isn't part of defaultSettings,
    // it's independent for controlling storage.
  }

  // Initialize settings on page load
  function initSettings() {
    // Check if saveMyPreference was previously checked and load if so
    const savedPref = localStorage.getItem("saveMyPreferenceChecked");
    if (savedPref === "true") {
      saveMyPreferenceCheckbox.checked = true;
      loadSettings(); // Load saved settings
    } else {
      saveMyPreferenceCheckbox.checked = false;
      applySettings(defaultSettings); // Apply default settings
    }
  }

  // Function to generate a single strong password
  function generatePassword() {
    let allCharacters = "";
    let initialCharacters = ""; // Characters for the first letter if 'begin with letter' is checked

    if (includeNumbersCheckbox.checked) {
      allCharacters += charSets.numbers;
    }
    if (includeLowercaseCheckbox.checked) {
      allCharacters += charSets.lowercase;
      initialCharacters += charSets.lowercase;
    }
    if (includeUppercaseCheckbox.checked) {
      allCharacters += charSets.uppercase;
      initialCharacters += charSets.uppercase;
    }
    if (includeSymbolsCheckbox.checked) {
      allCharacters += symbolsInput.value;
    }

    // Filter out similar characters if checked
    if (noSimilarCharactersCheckbox.checked) {
      charSets.similar.split("").forEach((char) => {
        allCharacters = allCharacters.replace(
          new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          ""
        );
        initialCharacters = initialCharacters.replace(
          new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          ""
        );
      });
    }

    if (allCharacters.length === 0) {
      alert(
        "Please select at least one character type (numbers, lowercase, uppercase, or symbols)."
      );
      return "";
    }

    const passwordLength = parseInt(passwordLengthSelect.value);
    let password = "";
    const usedCharacters = new Set(); // For no duplicate characters

    for (let i = 0; i < passwordLength; i++) {
      let char = "";
      let validCharFound = false;

      while (!validCharFound) {
        if (
          i === 0 &&
          beginWithLetterCheckbox.checked &&
          initialCharacters.length > 0
        ) {
          char = initialCharacters.charAt(
            Math.floor(Math.random() * initialCharacters.length)
          );
        } else {
          char = allCharacters.charAt(
            Math.floor(Math.random() * allCharacters.length)
          );
        }

        // Check for no duplicate characters
        if (
          noDuplicateCharactersCheckbox.checked &&
          usedCharacters.has(char) &&
          i < passwordLength - 1
        ) {
          // Allow duplicates if it's the last character and no other valid character can be found
          // This prevents infinite loop if passwordLength is too high and character set is too small
          if (
            allCharacters.length - usedCharacters.size === 0 &&
            i < passwordLength
          ) {
            validCharFound = true; // Force add if no unique chars left
          } else {
            continue;
          }
        }

        // Check for no sequential characters
        if (noSequentialCharactersCheckbox.checked && i >= 2) {
          const lastTwo = password.substring(i - 2, i);
          if (isSequential(lastTwo + char)) {
            continue;
          }
        }
        validCharFound = true;
      }
      password += char;
      usedCharacters.add(char);
    }

    return password;
  }

  // Check if a string is sequential (e.g., "abc", "789")
  function isSequential(str) {
    if (str.length < 3) return false;
    const codes = str.split("").map((c) => c.charCodeAt(0));
    let sequentialAsc = true;
    let sequentialDesc = true;

    for (let i = 0; i < codes.length - 1; i++) {
      if (codes[i + 1] !== codes[i] + 1) {
        sequentialAsc = false;
      }
      if (codes[i + 1] !== codes[i] - 1) {
        sequentialDesc = false;
      }
    }
    return sequentialAsc || sequentialDesc;
  }

  // Display generated passwords
  function displayPasswords() {
    passwordList.innerHTML = ""; // Clear previous passwords
    const quantity = parseInt(quantitySelect.value);
    const generatedPasswords = [];

    for (let i = 0; i < quantity; i++) {
      generatedPasswords.push(generatePassword());
    }

    generatedPasswords.forEach((pwd, index) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${index + 1}</span> <span>${pwd}</span>`;
      passwordList.appendChild(listItem);
    });
  }

  // --- Event Listeners ---

  // Populate dropdowns on initial load
  populateDropdowns();
  initSettings(); // Initialize settings

  // Generate passwords on button click
  generateButton.addEventListener("click", displayPasswords);

  // Save/Load preferences when checkbox is toggled
  saveMyPreferenceCheckbox.addEventListener("change", () => {
    if (saveMyPreferenceCheckbox.checked) {
      saveSettings();
    } else {
      localStorage.removeItem("passwordGeneratorSettings");
      localStorage.setItem("saveMyPreferenceChecked", "false"); // Persist unchecked state
    }
    // Always save the state of saveMyPreferenceCheckbox
    localStorage.setItem(
      "saveMyPreferenceChecked",
      saveMyPreferenceCheckbox.checked
    );
  });

  // Reset to default settings
  resetButton.addEventListener("click", () => {
    applySettings(defaultSettings);
    saveMyPreferenceCheckbox.checked = false; // Reset save preference checkbox too
    localStorage.removeItem("passwordGeneratorSettings"); // Clear saved settings
    localStorage.setItem("saveMyPreferenceChecked", "false"); // Update preference state
    displayPasswords(); // Regenerate with default settings
  });

  // Copy first line password
  copyFirstLineButton.addEventListener("click", () => {
    const firstPassword = passwordList.querySelector("li span:last-child");
    if (firstPassword) {
      navigator.clipboard
        .writeText(firstPassword.textContent)
        .then(() => alert("First password copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      alert("No password to copy.");
    }
  });

  // Copy all passwords
  copyAllButton.addEventListener("click", () => {
    const allPasswords = Array.from(
      passwordList.querySelectorAll("li span:last-child")
    )
      .map((span) => span.textContent)
      .join("\n");
    if (allPasswords) {
      navigator.clipboard
        .writeText(allPasswords)
        .then(() => alert("All passwords copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      alert("No passwords to copy.");
    }
  });

  // Auto-generate on first call
  if (autoGenerateCheckbox.checked) {
    displayPasswords();
  }
});

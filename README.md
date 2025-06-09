# Password Generator Plus

Password Generator Plus is a secure, client-side password generation tool built with HTML, CSS, and JavaScript. It allows users to create strong, customizable passwords directly in their browser with no data ever sent to a server.

## Features

This tool provides a wide range of options to tailor password generation to your specific needs:

- **Customizable Length**: Generate passwords from 6 to 50 characters long.
- **Character Sets**: Fine-tune the character composition of your passwords:
  - Include Numbers (`0-9`)
  - Include Lowercase Characters (`a-z`)
  - Include Uppercase Characters (`A-Z`)
  - Include Symbols (e.g., `!@#$%^&*()`, fully customizable)
- **Advanced Security Rules**:
  - **Begin With A Letter**: Force passwords to start with an alphabetic character.
  - **No Similar Characters**: Exclude visually ambiguous characters like `i, l, 1, L, O, 0`.
  - **No Duplicate Characters**: Ensure every character in the password is unique.
  - **No Sequential Characters**: Prevent sequences like `abc` or `789`.
- **Bulk Generation**: Create up to 500 passwords at once.
- **Preference Persistence**:
  - **Save My Preference**: Save all your current settings to the browser's local storage. Your preferred configuration will be automatically loaded the next time you open the page.
  - **Reset**: Instantly revert all settings back to their default state.
- **User-Friendly Interface**:
  - **Two-Column Layout**: A clean, organized interface for easy navigation.
  - **Easy Copying**: Copy a single password or all generated passwords to your clipboard with one click.
  - **Selective Text**: The line numbers for generated passwords are not selectable, allowing for easy copying of only the password text.
- **100% Client-Side**: All operations happen in your browser. No logs, no tracking, no network requests. Your security is paramount.

**Note:**

> I copied the UX from https://passwordsgenerator.net . I did this
> because half of the time the site was down. I wanted a solution of my
> own. I haven't copied any files from them. The Logic, JS and style are of my
> own. I only used there UX

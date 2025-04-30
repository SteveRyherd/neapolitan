# Wikipedia Environment Example

This example demonstrates how the Neapolitan Domain Switcher works by switching between different Wikipedia environments.

## Files in this Directory

- `fake-wikipedia.html` - A self-contained HTML page that mimics Wikipedia with environment-specific styling
- `serve-wiki.py` - A simple Python server script to serve the Wikipedia page locally

## How to Run the Server

1. Open Terminal
2. Navigate to this directory:
   ```bash
   cd /Users/steveryherd/Projects/Stable/neapolitan/.github/examples
   ```

3. Make the script executable and run it:
   ```bash
   chmod +x serve-wiki.py
   python3 serve-wiki.py
   ```

4. Access the fake Wikipedia page at:
   ```
   http://localhost:6969/wiki/Sandbox
   ```

5. Stop the server by pressing `Ctrl+C` in the terminal

## Environment Detection

The fake Wikipedia page automatically detects which environment it's running on and changes the styling:

- **Development (Localhost)**: Chocolate-colored banner with "May explode at any moment"
- **Test**: Strawberry-colored banner with "Slightly less likely to explode"
- **Production**: Vanilla-colored banner with "Please don't break anything"

## Testing with Neapolitan Domain Switcher

This example provides a perfect demonstration of switching between:

- `http://localhost:6969/wiki/Sandbox` (Development)
- `http://test.wikipedia.org/wiki/Sandbox` (Test/Staging)
- `http://wikipedia.org/wiki/Sandbox` (Production)

Use this to showcase how the browser extension makes it easy to switch between environments while maintaining the same path.
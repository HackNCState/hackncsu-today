# hackncsu-today

## Setup guide

i hope this all works if not let me know

### 1. Tooling

1. Install Python 3.14
2. Install Node.js 24.x
3. Clone this repository

### 2. Configuration

1. Create a Python virtual environment:

   ```bash
   python3 -m venv functions/venv
   ```

2. Activate the virtual environment:
   - On Windows:

     ```powershell
     functions\venv\Scripts\activate
      ```

   - On macOS/Linux:

      ```bash
      source functions/venv/bin/activate
      ```

3. Install the required Python packages:

   ```bash
    pip install -r functions/requirements.txt
    ```

4. Install the required Node.js packages:

   ```bash
   npm install
   ```

### 3. Running Locally

1. Run the backend emulator suite:

   ```bash
   npm run emulators
   ```

   The emulator will ask you to configure some parameters. I set defaults for these
   so you can just hit enter to accept them.

2. Run the frontend:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:8080` to see the application running locally.

On the login page, use **Preview as participant** to enter without Discord. This
development-only option creates an anonymous account and participant profile in
the local Firebase emulators. Use **(dev) View as Organizer** in the sidebar to
switch roles and initialize or edit event data locally.
If you already switched roles before the emulator permissions were added, use
**(dev) Refresh Organizer permissions** before initializing event data.

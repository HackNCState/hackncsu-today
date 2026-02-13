# hackncsu-today

## Setup guide

i hope this all works if not let me know

### Prerequisites

- `service-account.json` file with access to the Google Sheets API (let me know if you need access)
- `CLIENT_SECRET` value for Discord OAuth2 (let me know if you need this)
- Your Discord username in the Registration Google Sheet (so you can log in)

### 1. Tooling

1. Install [Firebase CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli)
2. Install Python 3.11 or higher
3. Install Node.js
4. Clone this repository

### 2. Configuration

1. Create a Python virtual environment:

   ```bash
   python -m venv functions/venv
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

5. This isn't best practice but we're using a service account file to allow you to access the spreadsheet data locally. Let me know and I'll share the file with you. Place it in the root of the project as `service-account.json`.

6. You'll also need a file `functions/.env.local` with the following content:

   ```env
   CLIENT_SECRET=<???>
   ```

   Let me know and I'll share the client secret with you.

### 3. Running Locally

1. Run the backend emulator suite:

   - On Windows:

       ```powershell
       $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\service-account.json"
       firebase emulators:start --project=hackncsu-today
       ```

   - On macOS/Linux:

       ```bash
       export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
       firebase emulators:start --project=hackncsu-today
       ```

   The emulator will ask you to configure some parameters. I set defaults for these
   so you can just hit enter to accept them.

2. Run the frontend:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:8080` to see the application running locally.

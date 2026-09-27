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

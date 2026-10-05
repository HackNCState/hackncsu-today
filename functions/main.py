# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os

from firebase_functions.options import set_global_options
from firebase_admin import credentials, initialize_app
from google.auth.credentials import AnonymousCredentials

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)


class _EmulatorCredential(credentials.Base):
    """The emulators don't check credentials, so skip looking up Google ones locally."""

    def get_credential(self):
        return AnonymousCredentials()


if os.getenv("FUNCTIONS_EMULATOR") == "true":
    # on macOS, the system proxy lookup crashes the emulator's forked workers
    os.environ.setdefault("no_proxy", "*")
    initialize_app(_EmulatorCredential())
else:
    initialize_app()

from auth.provision_user import *
from auth.login_link import *
from firestore.users import *
from firestore.teams import *
from firestore.schedule import *
from firestore.event import *

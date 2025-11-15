import os
import sys

# Make sure the `backend` package is on sys.path so top-level imports like `config` and
# `services` resolve consistently during pytest runs from repo root.
here = os.path.dirname(__file__)
backend_dir = os.path.abspath(os.path.join(here, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

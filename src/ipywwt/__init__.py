from typing import Any, Callable

from anywidget import AnyWidget
from pathlib import Path

bundler_output_dir = Path(__file__).parent / "static"


class WWTWidget(AnyWidget):
    _esm = bundler_output_dir / "index.js"
    _css = bundler_output_dir / "style.css"

    # attributes = traitlets.Dict(default_value=None, allow_none=True).tag(sync=True)

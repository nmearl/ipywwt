import pathlib

from anywidget import AnyWidget
from traitlets import Unicode, Int

bundler_output_dir = pathlib.Path(__file__).parent / "static"


class WWT(AnyWidget):
    _esm = (bundler_output_dir / "index.mjs").read_text()
    # _css = (bundler_output_dir / "styles.css").read_text()
    name = Unicode().tag(sync=True)

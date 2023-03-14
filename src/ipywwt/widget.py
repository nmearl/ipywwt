import pathlib

from anywidget import AnyWidget
from traitlets import Unicode, Int

bundler_output_dir = pathlib.Path(__file__).parent / "static"


class WWT(AnyWidget):
    _esm = (bundler_output_dir / "index.mjs").read_text()
    # _css = (bundler_output_dir / "styles.css").read_text()
    name = Unicode().tag(sync=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.on_msg(self._handle_custom_msg)

    def _handle_custom_msg(self, data, buffers):
        print(f"Received message:\n{data}\n{buffers}")

    def center_on_coordinates(self, ra, dec, fov, instant, roll=None):
        """
        Navigate the camera to the specified position, asynchronously.

        Parameters
        ----------
        ra : float
            The right ascension to seek to, in radians.
        dec : float
            The declination to seek to, in radians.
        fov : float
            The zoom / field of view, in degrees.
        instant : bool
            Whether to snap the camera instantly, or pan it.
        roll : float, optional
            If specified, the roll of the target camera position, in radians.
        """
        self.send({
            'type': 'meth_call',
            'meth_name': 'gotoRADecZoom',
            'meth_args': (ra, dec, fov, instant, roll)
        })

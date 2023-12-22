from dataclasses import dataclass, field, asdict
from pathlib import Path

import astropy.units as u
from astropy.time import Time
from anywidget import AnyWidget
from traitlets import Unicode, Float, observe
import logging

from .messages import *
from .imagery import get_imagery_layers
from .layers import TableLayer, LayerManager

bundler_output_dir = Path(__file__).parent / "static"

DEFAULT_SURVEYS_URL = "https://worldwidetelescope.github.io/pywwt/surveys.xml"

logger = logging.getLogger("pywwt")


class WWTWidget(AnyWidget):
    _esm = bundler_output_dir / "main.js"
    _css = bundler_output_dir / "style.css"

    background = Unicode(
        "Hydrogen Alpha Full Sky Map",
        help="The layer to show in the background (`str`)",
    )

    foreground = Unicode(
        "Digitized Sky Survey (Color)",
        help="The layer to show in the foreground (`str`)",
    )

    foreground_opacity = Float(
        0.8, help="The opacity of the foreground layer " "(`float`)"
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._callbacks = {}

        self.on_msg(self._on_app_message_received)

        self._available_layers = get_imagery_layers(DEFAULT_SURVEYS_URL)
        self.load_image_collection()

        self.layers = LayerManager(parent=self)

    def _send_msg(self, **kwargs):
        """
        Translate PyWWT-style raw dict messages to structured message classes.
        """
        msg_cls = msg_ref[kwargs["event"]]
        self.send(msg_cls(**kwargs))

    def send(self, msg: RemoteAPIMessage, buffers=None):
        super().send(asdict(msg), buffers)

    # def _handle_custom_msg(self, data, buffers):
    #     print(f"Received message:\n{data}\n{buffers}")

    def load_image_collection(self, url=DEFAULT_SURVEYS_URL):
        self.send(LoadImageCollectionMessage(url))

    @observe("foreground")
    def _on_foreground_change(self, changed):
        self.send(SetForegroundByNameMessage(name=changed["new"]))

        self.send(
            SetForegroundByOpacityMessage(
                value=self.foreground_opacity * 100,
            )
        )

    @observe("background")
    def set_background_image(self, changed):
        self.send(SetBackgroundByNameMessage(name=changed["new"]))

        self.send(
            SetForegroundByOpacityMessage(
                value=self.foreground_opacity * 100,
            )
        )

    def center_on_coordinates(self, coord, fov=60 * u.deg, roll=None, instant=True):
        """
        Navigate the camera to the specified position, asynchronously.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The set of coordinates the view should center on.
        fov : `~astropy.units.Quantity`, optional
            The desired field of view.
        roll: `~astropy.units.Quantity`, optional
            The desired roll angle of the camera. If not specified, the
            roll angle is not changed.
        instant : `bool`, optional
            Whether the view changes instantly or smoothly scrolls to the
            desired location.
        """
        coord_icrs = coord.icrs

        msg = CenterOnCoordinatesMessage(
            ra=coord_icrs.ra.radian,
            dec=coord_icrs.dec.radian,
            fov=fov.to(u.deg).value,
            instant=instant,
        )

        self.send(msg)

    def _on_app_message_received(self, payload, *args, **kwargs):
        """
        Call this function when a message is received from the research app.
        This will generally happen in some kind of asynchronous event handler,
        so there is no guarantee that exceptions raised here will be exposed to
        the user.
        """
        print(f"Received message:\n{payload}")

        ptype = payload.get("type")
        # some events don't have type but do have: pevent = payload.get('event')

        updated_fields = []

        if ptype == "wwt_view_state":
            try:
                self._raRad = float(payload["raRad"])
                self._decRad = float(payload["decRad"])
                self._fovDeg = float(payload["fovDeg"])
                self._rollDeg = float(payload["rollDeg"])
                self._engineTime = Time(payload["engineClockISOT"], format="isot")
                self._systemTime = Time(payload["systemClockISOT"], format="isot")
                self._timeRate = float(payload["engineClockRateFactor"])
            except ValueError:
                pass  # report a warning somehow?
        elif ptype == "wwt_application_state":
            hipscat = payload.get("hipsCatalogNames")

            if hipscat is not None:
                self._available_hips_catalog_names = hipscat

        elif ptype == "wwt_selection_state":
            most_recent = payload.get("mostRecentSource")
            sources = payload.get("selectedSources")

            if most_recent is not None:
                self._most_recent_source = most_recent
                updated_fields.append("most_recent_source")

            if sources is not None:
                self._selected_sources = sources
                updated_fields.append("selected_sources")

        # Any relevant async future to resolve?

        tid = payload.get("threadId")

        if tid is not None:
            try:
                fut = self._futures.pop(tid)
            except KeyError:
                pass
            else:
                fut.set_result(payload)

        # Any client-side callbacks to execute?

        callback = self._callbacks.get(ptype)
        if callback:
            try:
                callback(self, updated_fields)
            except:  # noqa: E722
                logger.exception("unhandled Python exception during a callback")

    def _set_message_type_callback(self, ptype, callback):
        """
        Set a callback function that will be executed when the widget receives
        a message with the given type.

        Parameters
        ----------
        ptype: str
            The string that identifies the message type
        callback: `BaseWWTWidget`
            A callable object which takes two arguments: the WWT widget
            instance, and a list of updated properties.
        """
        self._callbacks[ptype] = callback

    def set_selection_change_callback(self, callback):
        """
        Set a callback function that will be executed when the widget receives
        a selection change message.

        Parameters
        ----------
        callback:
            A callable object which takes two arguments: the WWT widget
            instance, and a list of updated properties.
        """
        self._set_message_type_callback("wwt_selection_state", callback)

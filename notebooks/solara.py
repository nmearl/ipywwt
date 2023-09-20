"""
Example usage of ipywwt in a solara app. Run with:
    solara run notebooks/solara.py
"""
import solara
from ipywwt import WWTWidget
import ipywidgets as w


# @solara.component
# def Page():
#     with solara.Card() as col:
#         slider = solara.SliderInt("Word limit", value=100, min=2, max=20)
#
#         with w.VBox() as vbox:
#             wwt = WWTWidget()
#             button = w.Button(description="Clicked 0 times")
#
#         # w.VBox([wwt, button])
#
#     return col

wwt1 = WWTWidget()
wwt2 = WWTWidget()
button = w.Button(description="Clicked 0 times")
page = w.VBox([wwt1, wwt2, button])

.. These are examples of badges you might want to add to your README:
   please update the URLs accordingly

    .. image:: https://api.cirrus-ci.com/github/<USER>/ipywwt.svg?branch=main
        :alt: Built Status
        :target: https://cirrus-ci.com/github/<USER>/ipywwt
    .. image:: https://readthedocs.org/projects/ipywwt/badge/?version=latest
        :alt: ReadTheDocs
        :target: https://ipywwt.readthedocs.io/en/stable/
    .. image:: https://img.shields.io/coveralls/github/<USER>/ipywwt/main.svg
        :alt: Coveralls
        :target: https://coveralls.io/r/<USER>/ipywwt
    .. image:: https://img.shields.io/pypi/v/ipywwt.svg
        :alt: PyPI-Server
        :target: https://pypi.org/project/ipywwt/
    .. image:: https://img.shields.io/conda/vn/conda-forge/ipywwt.svg
        :alt: Conda-Forge
        :target: https://anaconda.org/conda-forge/ipywwt
    .. image:: https://pepy.tech/badge/ipywwt/month
        :alt: Monthly Downloads
        :target: https://pepy.tech/project/ipywwt
    .. image:: https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Twitter
        :alt: Twitter
        :target: https://twitter.com/ipywwt

   .. image:: https://img.shields.io/badge/-PyScaffold-005CA0?logo=pyscaffold
       :alt: Project generated with PyScaffold
       :target: https://pyscaffold.org/

======
ipywwt
======

IPyWidget wrapper around the WWTelescope Vue-based front-end application.

Installation
============

Install ``ipywwt`` from the repository using

.. code-block:: bash

   pip install git+https://github.com/nmearl/ipywwt

For development, clone the repository and install with

.. code-block:: bash
   pip install -e .

Usage
=====

In your Jupyter Lab or Jupyter Notebook environment, import the `WWTWidget` and instantiate:

.. code-block:: python

   from ipywwt import WWTWidget

   wwt = WWTWidget()
   wwt

Building
========

To regenerate the built javascript and CSS files during development, use Vite to build the source:

.. code-block:: bash

   npx vite build

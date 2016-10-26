from setuptools import setup

setup(name='framework',
    version='0.1',
    license='MIT',
    install_requires=[
      'requests',
      'autobahn',
      'websockets'
      ],
    zip_safe=False)

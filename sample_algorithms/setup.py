from setuptools import setup

setup(name='framework',
    version='0.1',
    license='MIT',
    install_requires=[
      'asyncio',
      'overpass',
      'requests',
      'websockets'
      ],
    zip_safe=False)

from setuptools import setup, find_packages

setup(
    name='ckanext-restrict_visibility',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    package_data={
        'ckanext.restrict_visibility': [
            'templates/package/snippets/package_basic_fields.html',
        ],
    },
    entry_points="""
        [ckan.plugins]
        restrict_visibility=ckanext.restrict_visibility.plugin:RestrictVisibilityPlugin
    """,
)

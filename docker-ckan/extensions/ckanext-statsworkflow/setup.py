from setuptools import setup, find_packages

setup(
    name='ckanext-statsworkflow',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    package_data={
        'ckanext.statsworkflow': [
            'templates/package/read.html',
            'templates/package/snippets/workflow_actions.html',
            'templates/package/resource_read.html',
            'templates/package/snippets/resource_item.html',
            'templates/package/snippets/resources.html',
        ],
    },
    entry_points='''
        [ckan.plugins]
        statsworkflow=ckanext.statsworkflow.plugin:StatsWorkflowPlugin
    ''',
)

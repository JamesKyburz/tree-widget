var root = {
  'path': '/root',
  'type': 'directory',
  'key': '/',
  'entries': [
    {
      'path': 'a.out',
      'entries': [],
      'type': 'file'
    },
    {
      'path': 'foo',
      'entries': [
        {
          'path': 'bar',
          'entries': [
            {
              'path': 'baz',
              'entries': [],
              'type': 'file'
            }
          ],
          'type': 'directory'
        }
      ],
      'type': 'directory'
    },
    {
      'path': 'bar',
      'entries': [
        {
          'path': 'foo',
          'id': 30,
          'entries': [],
          'type': 'file'
        }
      ],
      'type': 'directory'
    }
  ]
}

var react = require('react')
var reactDOM = require('react-dom')
var Tree = require('tree-widget')(react)

var opt = {
  root: root,
  onSelect: function (selected) {
    console.log('selected', selected)
  }
}

reactDOM.render(react.createElement(Tree, opt), window.document.body)

var hyperx = require('hyperx')
var css = require('insert-css')
var fs = require('fs')
var path = require('path')

module.exports = create
create.items = items

function create (react) { return new Tree(react) }

function Tree (react) {
  var hx = hyperx(react.createElement)
  return react.createClass({
    getInitialState: function () {
      return {
        selected: this.props.selected || [],
        open: this.props.open || [],
        toggled: []
      }
    },
    componentDidMount: function () {
      if (this.props.style !== false) css(fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8'))
      var self = this
      this.keyDown = function (e) { self.shift = e.shiftKey }
      this.keyUp = function (e) { self.shift = false }
      window.addEventListener('keydown', this.keyDown)
      window.addEventListener('keyup', this.keyUp)
    },
    componentWillUnmount: function () {
      window.removeEventListener('keydown', this.keyDown)
      window.removeEventListener('keyup', this.keyUp)
    },
    render: function () {
      return hx`
        <div class='tree-view'>
          ${this.renderDirectory(this.props.root)}
        </div>
      `
    },
    renderDirectory: function renderDirectory (root) {
      var toggled = this.state.toggled.indexOf(root) !== -1
      var open = (root.open && !toggled) || this.state.open.indexOf(root) !== -1
      var className = 'entry'
      className += root.entries.length ? ' directory' : ' file'
      className += this.state.selected.indexOf(root) === -1 ? '' : ' selected'
      className += open ? ' open' : ''

      return hx`
        <ul>
          <li key=${root.path} class=${className} onClick=${this.toggle(root)}>
            <div class='list-item'>
              <span data-id=${root.id}><a>${root.path}</a></span>
              ${root.html ? hx`<span dangerouslySetInnerHTML=${({__html: root.html})} />` : ''}
            </div>

            ${open || toggled ? root.entries.map(this.renderDirectory) : ''}
          </li>
        </ul>
      `
    },
    toggle: function (root) {
      return function (e) {
        var el = e.target
        var type = !root.entries.length || /A|SPAN/.test(el.nodeName) ? 'selected' : 'open'
        while (el.nodeName !== 'LI') el = el.parentNode
        var state = this.state[type]
        var pos = state.indexOf(root)
        if (type === 'open' && root.open && pos === -1 && this.state.toggled.indexOf(root) === -1) {
          state.push(root)
          pos = state.length - 1
        }
        if (type === 'selected' && !this.shift) {
          state = pos === -1 ? [root] : []
        } else {
          if (pos === -1) {
            state.push(root)
          } else {
            state.splice(pos, 1)
          }
        }
        var newState = {}
        newState[type] = state
        newState.toggled = this.state.toggled.concat([root])
        if (newState.selected && this.props.onSelect) this.props.onSelect(items({ entries: newState.selected }))
        if (newState.open && this.props.onOpen && newState.open.indexOf(root) !== -1) this.props.onOpen(root)
        this.setState(newState)
        e.stopPropagation()
      }.bind(this)
    }
  })
}

function items (item) {
  if (item.type === 'file') return item
  return item.entries
    .map(items)
    .reduce(
      function (sum, x) {
        return (Array.isArray(x) ? x : [x]).concat(sum)
      }, []
    )
}

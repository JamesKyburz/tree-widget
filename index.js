var hyperx = require('hyperx')
var css = require('insert-css')
var fs = require('fs')
var path = require('path')

module.exports = create

function create (react) { return new Tree(react) }

function Tree (react) {
  var hx = hyperx(react.createElement)
  return react.createClass({
    componentDidMount: function () {
      if (this.props.style !== false) {
        css(fs.readFileSync(path.join(__dirname, 'style.css'), 'utf-8'))
      }
      var self = this
      this.selected = []
      this.selectedEl = []
      this.keyDown = function (e) { self.shift = e.shiftKey }
      this.keyUp = function (e) { self.shift = false }
      window.addEventListener('keydown', this.keyDown)
      window.addEventListener('keyup', this.keyUp)
    },
    componentWillUnmount: function () {
      window.removeEventListener('keydown', this.keyDown)
      window.removeEventListener('keyup', this.keyUp)
    },
    componentWillUpdate: function () { return false },
    render: function () {
      return hx`
        <div class='tree-view'>
          ${this.renderDirectory(this.props.root)}
        </div>
      `
    },
    renderDirectory: function renderDirectory (root) {
      return hx`
        <ul>
          <li key=${root.path} class=${root.entries.length ? 'entry directory' : 'entry file'} onClick=${this.toggle(root)}>
            <div class='list-item'>
              <span><a>${root.path}</a></span>
            </div>
            ${root.entries.map(this.renderDirectory)}
          </li>
        </ul>
      `
    },
    toggle: function (root) {
      return function (e) {
        var el = e.target
        var className = !root.entries.length || /A|SPAN/.test(el.nodeName) ? 'selected' : 'open'
        while (el.nodeName !== 'LI') el = el.parentNode
        var toggle = el.classList.contains(className)
        if (className === 'selected') {
          if (this.shift) {
            if (!toggle) {
              this.selectedEl.push(el)
              this.selected.push(root)
            } else {
              var index = this.selected.indexOf(root)
              this.selectedEl.splice(index, 1)
              this.selected.splice(index, 1)
            }
          } else {
            this.selectedEl.forEach(function (el) { el.classList.remove('selected') })
            this.selectedEl = toggle ? [] : [el]
            this.selected = toggle ? [] : [root]
          }
        }
        el.classList[toggle ? 'remove' : 'add'](className)
        if (this.props.onSelect) this.props.onSelect(this.selected)
        e.stopPropagation()
      }.bind(this)
    }
  })
}

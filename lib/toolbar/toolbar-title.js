var React = require('react');
var StylePropable = require('../mixins/style-propable');

var ToolbarTitle = React.createClass({displayName: "ToolbarTitle",

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    text: React.PropTypes.string,
  },

  getTheme: function() {
    return this.context.muiTheme.component.toolbar;
  },

  render: function() {

    var styles = this.mergeAndPrefix({
      paddingRight: this.context.muiTheme.spacing.desktopGutterLess,
      lineHeight: this.getTheme().height + 'px',
      fontSize: this.getTheme().titleFontSize + 'px',
      display: 'inline-block',
      position: 'relative',
    }, this.props.style);

    return (
      React.createElement("span", {className: this.props.className, style: styles}, this.props.text)
    );
  }

});

module.exports = ToolbarTitle;

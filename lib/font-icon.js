var React = require('react');
var StylePropable = require('./mixins/style-propable');
var Spacing = require('./styles/spacing');

var FontIcon = React.createClass({displayName: "FontIcon",

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      isHovered: false,
    };
  },

  getTheme: function() {
    return this.context.muiTheme.palette;
  },

  getStyles: function() {
    var styles = {
      position: 'relative',
      fontSize: Spacing.iconSize + 'px',
      display: 'inline-block',
      userSelect: 'none'  
    };
    if (!styles.color && !this.props.className) {
      styles.color = this.getTheme().textColor;
    }
    return styles;
  },

  render: function() {
    var $__0=
      
      
      this.props,style=$__0.style,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{style:1});

    return (
      React.createElement("span", React.__spread({},  other, 
        {style: this.mergeAndPrefix(
          this.getStyles(),
          this.props.style)}))
    );
  }
});

module.exports = FontIcon;

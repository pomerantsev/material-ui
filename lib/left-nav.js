var React = require('react');
var KeyCode = require('./utils/key-code');
var StylePropable = require('./mixins/style-propable');
var Transitions = require('./styles/transitions');
var WindowListenable = require('./mixins/window-listenable');
var Overlay = require('./overlay');
var Paper = require('./paper');
var Menu = require('./menu/menu');

var LeftNav = React.createClass({displayName: "LeftNav",

  mixins: [StylePropable, WindowListenable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    className: React.PropTypes.string,
    docked: React.PropTypes.bool,
    header: React.PropTypes.element,
    menuItems: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func,
    onNavOpen: React.PropTypes.func,
    onNavClose: React.PropTypes.func,
    openRight: React.PropTypes.bool,
    selectedIndex: React.PropTypes.number
  },

  windowListeners: {
    'keyup': '_onWindowKeyUp',
    'resize': '_onWindowResize'
  },

  getDefaultProps: function() {
    return {
      docked: true
    };
  },

  getInitialState: function() {
    return {
      translateX: this.props.docked ? 0 : this._getMaxTranslateX(),
      swiping: false
    };
  },
  
  componentDidMount: function() {
    this._updateMenuHeight();
    this._enableSwipeHandling();
  },
  
  componentDidUpdate: function(prevProps, prevState) {
    this._updateMenuHeight();
    this._enableSwipeHandling();
  },

  componentWillUnmount: function() {
    this._disableSwipeHandling();
  },

  toggle: function() {
    this.setState({ translateX: this._isOpen() ? this._getMaxTranslateX() : 0 });
    return this;
  },

  close: function() {
    this.setState({ translateX: this._getMaxTranslateX() });
    if (this.props.onNavClose) this.props.onNavClose();
    return this;
  },

  open: function() {
    this.setState({ translateX: 0 });
    if (this.props.onNavOpen) this.props.onNavOpen();
    return this;
  },

  getThemePalette: function() {
    return this.context.muiTheme.palette;
  },

  getTheme: function() {
    return this.context.muiTheme.component.leftNav;
  },

  getStyles: function() {
    var x = this._getTranslateMultiplier() * this.state.translateX + 'px';
    var styles = {
      root: {
        height: '100%',
        width: this.getTheme().width,
        position: 'fixed',
        zIndex: 10,
        left: 0,
        top: 0,
        transform: 'translate3d(' + x + ', 0, 0)',
        transition: !this.state.swiping && Transitions.easeOut(),
        backgroundColor: this.getTheme().color,
        overflow: 'hidden'
      },
      menu: {
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%'
      },
      menuItem: {
        height: this.context.muiTheme.spacing.desktopLeftNavMenuItemHeight,
        lineDeight: this.context.muiTheme.spacing.desktopLeftNavMenuItemHeight
      },
      rootWhenOpenRight: {
        left: 'auto',
        right: '0'
      }
    };
    styles.menuItemLink = this.mergeAndPrefix(styles.menuItem, {
      display: 'block',
      textDecoration: 'none',
      color: this.getThemePalette().textColor
    });
    styles.menuItemSubheader = this.mergeAndPrefix(styles.menuItem, {
      overflow: 'hidden'
    });

    return styles;
  },

  render: function() {
    var selectedIndex = this.props.selectedIndex;
    var overlay;

    var styles = this.getStyles();
    if (!this.props.docked) {
      overlay = React.createElement(Overlay, {show: !this._isClosed(), 
                         opacity: 1 - this.state.translateX / this._getMaxTranslateX(), 
                         transitionEnabled: !this.state.swiping, 
                         onTouchTap: this._onOverlayTouchTap});
    }


    return (
      React.createElement("div", {className: this.props.className}, 
        overlay, 
        React.createElement(Paper, {
          ref: "clickAwayableElement", 
          zDepth: 2, 
          rounded: false, 
          transitionEnabled: !this.state.swiping, 
          style: this.mergeAndPrefix(
            styles.root, 
            this.props.openRight && styles.rootWhenOpenRight,
            this.props.style)}, 
            this.props.header, 
            React.createElement(Menu, {
              ref: "menuItems", 
              style: this.mergeAndPrefix(styles.menu), 
              zDepth: 0, 
              menuItems: this.props.menuItems, 
              menuItemStyle: this.mergeAndPrefix(styles.menuItem), 
              menuItemStyleLink: this.mergeAndPrefix(styles.menuItemLink), 
              menuItemStyleSubheader: this.mergeAndPrefix(styles.menuItemSubheader), 
              selectedIndex: selectedIndex, 
              onItemClick: this._onMenuItemClick})
        )
      )
    );
  },
  
  _updateMenuHeight: function() {
    if (this.props.header) {
      var container = this.refs.clickAwayableElement.getDOMNode();
      var menu = this.refs.menuItems.getDOMNode();
      var menuHeight = container.clientHeight - menu.offsetTop;
      menu.style.height = menuHeight + 'px';
    }
  },

  _onMenuItemClick: function(e, key, payload) {
    if (this.props.onChange && this.props.selectedIndex !== key) {
      this.props.onChange(e, key, payload);
    }
    if (!this.props.docked) this.close();
  },

  _onOverlayTouchTap: function() {
    this.close();
  },

  _onWindowKeyUp: function(e) {
    if (e.keyCode == KeyCode.ESC &&
        !this.props.docked &&
        this.state.open) {
      this.close();
    }
  },
  
  _onWindowResize: function(e) {
    this._updateMenuHeight();
  },

  _getMaxTranslateX: function() {
    return this.getTheme().width + 10;
  },

  _isOpen: function() {
    return this.state.translateX === 0;
  },

  _isClosed: function() {
    return this.state.translateX === this._getMaxTranslateX();
  },

  _getTranslateMultiplier: function() {
    return this.props.openRight ? 1 : -1;
  },

  _enableSwipeHandling: function() {
    if (this._isOpen() && !this.props.docked) {
      document.body.addEventListener('touchstart', this._onBodyTouchStart);
    } else {
      this._disableSwipeHandling();
    }
  },

  _disableSwipeHandling: function() {
    document.body.removeEventListener('touchstart', this._onBodyTouchStart);
  },

  _onBodyTouchStart: function(e) {
    var swipeStartX = e.touches[0].pageX;
    this.setState({
      swiping: true,
      swipeStartX: swipeStartX
    });

    document.body.addEventListener('touchmove', this._onBodyTouchMove);
    document.body.addEventListener('touchend', this._onBodyTouchEnd);
    document.body.addEventListener('touchcancel', this._onBodyTouchEnd);
  },

  _onBodyTouchMove: function(e) {
    var currentX = e.touches[0].pageX;
    this.setState({
      translateX: Math.min(
                    Math.max(
                      this._getTranslateMultiplier() * (currentX - this.state.swipeStartX),
                      0
                    ),
                    this._getMaxTranslateX()
                  )
    });
  },

  _onBodyTouchEnd: function() {
    this.setState({
      swiping: false
    });

    this.close();

    document.body.removeEventListener('touchmove', this._onBodyTouchMove);
    document.body.removeEventListener('touchend', this._onBodyTouchEnd);
    document.body.removeEventListener('touchcancel', this._onBodyTouchEnd);
  }
  
});

module.exports = LeftNav;

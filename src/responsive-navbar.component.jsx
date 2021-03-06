/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-find-dom-node */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import './responsive-navbar.scss';

export default class ResponsiveNavbar extends React.PureComponent {
  static defaultProps = {
    onSelect: null,
    showNavItemBorder: false,
    showNavItemTooltip: true,
    tooltipDelay: 2000,
    fontSize: 'inherit',
    fontWeight: 'inherit',
    placeholder: 'more...',
    height: '40px',
    initialUpdateDelay: 200,
  }

  static propTypes = {
    showNavItemBorder: PropTypes.bool,
    showNavItemTooltip: PropTypes.bool,
    tooltipDelay: PropTypes.number,
    fontSize: PropTypes.string,
    fontWeight: PropTypes.string,
    placeholder: PropTypes.string,
    activeKey: PropTypes.number.isRequired,
    list: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
      ]).isRequired,
      href: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    onSelect: PropTypes.func,
    height: PropTypes.string,
    initialUpdateDelay: PropTypes.number,
  }

  state = {
    updateDimenssions: false,
    lastVisibleItemIndex: -1,
    lastWidth: 0,
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent);
    window.addEventListener('orientationchange', this.handleResizeEvent); // for mobile support
    // Component is not rendered yet by browser when DidMount is called
    setTimeout(() => {
      this.handleResizeEvent();
    }, this.props.initialUpdateDelay);
  }

  componentDidUpdate() {
    if (this.state.updateDimenssions) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        // 2nd render is triggered here in purpose
        updateDimenssions: false,
        lastVisibleItemIndex: this.indexOfLastVisibleNavItem(),
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent);
    window.removeEventListener('orientationchange', this.handleResizeEvent); // for mobile support
  }

  indexOfLastVisibleNavItem = () => {
    const container = this.refs.navbarContainer;
    const containerWidth = ReactDOM.findDOMNode(container) ?
      ReactDOM.findDOMNode(container).offsetWidth : 0;

    let remainingWidth = containerWidth - 195;

    let lastVisible = 1;
    for (let i = 0; i < this.props.list.length - 1; i += 1) {
      const item = this.refs[`navitemref${String(i)}`];
      const node = ReactDOM.findDOMNode(item);
      if (!node) {
        break;
      }
      const itemWidth = node.offsetWidth;
      remainingWidth -= itemWidth;
      if (remainingWidth < 0) {
        lastVisible -= 1;
        break;
      }
      lastVisible += 1;
    }

    return lastVisible;
  }

  handleResizeEvent = () => {
    const difference = window.innerWidth - this.state.lastWidth;
    const UPDATE_THRESHOLD = 50;
    if (Math.abs(difference) > UPDATE_THRESHOLD) {
      this.setState({
        updateDimenssions: true,
        lastWidth: window.innerWidth,
      });
    }
  }
  selectionChanged = (item) => {
    this.props.router.push(item.value);
  }

  tooltipWrapper = (node, index, tooltipContent) => {
    const tooltip = <Tooltip id="tooltip">{tooltipContent}</Tooltip>;
    return !this.props.showNavItemTooltip ? node :
    <OverlayTrigger placement="bottom" key={index} overlay={tooltip} delayShow={this.props.tooltipDelay}>
      {node}
    </OverlayTrigger>;
  }

  navbarItem = (item, index, className) => (
    <button
      className={index === this.props.activeKey &&
        index <= this.state.lastVisibleItemIndex ?
        `${className} selected-border` : `${className}`}
      style={{ fontWeight: this.props.fontWeight, fontSize: this.props.fontSize }}
      id={item.id || `navitemref${String(index)}`}
      key={item.id || `navitemref${String(index)}`}
      ref={`navitemref${String(index)}`}
      onClick={() => { this.props.onSelect(item.href); }}
    >
      <span className="responsive-navbar-item-text">{item.name}</span>
    </button>
  )

  navbar = () => {
    const list = this.state.lastVisibleItemIndex >= 0 ?
      this.props.list.slice(0, this.state.lastVisibleItemIndex)
      : this.props.list;
    const className = this.props.showNavItemBorder ?
      'responsive-navbar-item inactive-border' : 'responsive-navbar-item';
    const items = list.map((item, index) => (
      this.tooltipWrapper(this.navbarItem(item, index, className), index, item.name)
    ));
    const navbarStyle = {
      minHeight: this.props.height,
    };
    if (this.props.height.slice(-2) === 'px') {
      const heightPx = parseInt(this.props.height.slice(0, -2), 10);
      navbarStyle.lineHeight = `${(heightPx - 4)}px`;
    }
    return (
      <div
        id="responsive-navbar-container"
        ref="navbarContainer"
        style={navbarStyle}
      >
        {items}
        {this.combobox()}
      </div>
    );
  }

  combobox = () => {
    if (this.state.lastVisibleItemIndex === -1 ||
        this.state.lastVisibleItemIndex > this.props.list.length - 1) {
      // return null if all nav items are visible
      return null;
    }

    // slice nav items list and show invisible items in the combobox
    const list = this.state.lastVisibleItemIndex >= 0 ?
      this.props.list.slice(this.state.lastVisibleItemIndex)
      : this.props.list;
    const items = list.map((item, index) =>
      ({
        value: item.href,
        label: item.name,
        id: index,
        ref: `navitemref${String(index)}`,
      }));

    const inactiveBorder = this.props.showNavItemBorder ? 'inactive-border' : '';
    const borderClass = this.props.activeKey >= this.state.lastVisibleItemIndex ?
      'selected-border' : inactiveBorder;
    const activeItem = this.props.list[this.props.activeKey];
    return (
      <div
        id="responsive-navbar-select"
        className={borderClass}
        style={{ fontWeight: this.props.fontWeight, fontSize: this.props.fontSize }}
      >
        <Select
          name="responsiveNavbarSelect"
          multi={false}
          value={activeItem ? activeItem.href : ''}
          clearable={false}
          placeholder={this.props.placeholder}
          options={items}
          onChange={(item) => { this.props.onSelect(item.value); }}
          inputProps={{ id: 'ocResponsiveNavbarSelect' }}
        />
      </div>
    );
  }

  render() {
    return this.navbar();
  }
}

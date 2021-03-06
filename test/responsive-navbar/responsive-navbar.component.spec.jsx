/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

import ResponsiveNavbar from '../../src/index';

describe('Responsive navbar component', function describe() {
  before(function before() {
    this.list = [
      { id: 'Item1', name: 'Style', href: '/autocomplete' },
      { id: 'Item2', name: 'Item 2 longer and longer', href: '/autocomplete' },
      { id: 'Item3', name: 'Item 3 even longer and longer', href: '/autocomplete' },
      { id: 'Item4', name: 'Item 4', href: '/autocomplete' },
    ];
  });

  it('should render navbar correctly', function it() {
    const activeKey = 2;

    const wrapper = mount(<ResponsiveNavbar
      activeKey={activeKey}
      list={this.list}
      router={[]}
    />);

    expect(wrapper.props().activeKey).to.eql(2);
    expect(wrapper.find('button').at(0).text()).to.eql('Style');
    expect(wrapper.state()).to.eql(
      { lastWidth: 0, updateDimenssions: false, lastVisibleItemIndex: -1 });
  });

  it('should render combobox correctly', function it() {
    const activeKey = 2;

    const wrapper = mount(<ResponsiveNavbar
      activeKey={activeKey}
      list={this.list}
      router={[]}
    />);

    // Make the call manually since there's is a timeout in componentDidMount
    wrapper.instance().handleResizeEvent();
    wrapper.update();
    expect(wrapper.find('#ocResponsiveNavbarSelect').hostNodes().length).to.eql(1);
    expect(wrapper.find('Select').length).to.eql(1);
  });

  it('updates state correctly', function it() {
    const activeKey = 1;

    const navbar = new ResponsiveNavbar({
      list: this.list,
      activeKey,
    });

    // initial state
    expect(navbar.state).to.eql({
      updateDimenssions: false,
      lastVisibleItemIndex: -1,
      lastWidth: 0,
    });

    let offsetWidth = 400;
    const findDOMNode = sinon.stub(ReactDOM, 'findDOMNode').callsFake(() =>
      ({ offsetWidth }),
    );

    const navbarStub = sinon.stub(navbar, 'setState').callsFake((state) => {
      navbar.state = state;
    });

    navbar.state.lastWidth = 0;
    navbar.handleResizeEvent();
    navbar.componentDidUpdate();

    // sets updateDimenssions false lastVisibleItemIndex should be 2
    expect(navbar.state).to.eql({
      updateDimenssions: false,
      lastVisibleItemIndex: 0,
    });

    navbar.state.lastWidth = 0;
    offsetWidth = 200;
    navbar.handleResizeEvent();
    navbar.componentDidUpdate();

    // sets updateDimenssions false lastVisibleItemIndex should be 1
    expect(navbar.state).to.eql({
      updateDimenssions: false,
      lastVisibleItemIndex: 0,
    });

    findDOMNode.restore();
    navbarStub.restore();
  });
});

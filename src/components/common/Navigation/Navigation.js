import React, { useState } from 'react';
import './Navigation.css';
import Input from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

const Navigation = (props) => {
  const [showSearch, setShowSearch] = useState(false);
  const renderSearch = () => {
    setShowSearch(!showSearch);
  };
  const handlesearchChange = (event) => {
    props.setSearch(event.target.value);
    console.log(props.search);
  };
  const leftNav = (
    <div className="navbar-left__container">
      <div className="navbar-left__item">
        {' '}
        <div
          className="navbar-left__logo"
          // src={'https://neeva.co/neeva-wordmark.svg'}
          // alt={'neeva logo'}
        ></div>
      </div>
      <div className="navbar-left__item">
        {' '}
        <a href="/" className="navbar-left__link">
          About
        </a>
      </div>
      <div className="navbar-left__item">
        {' '}
        <a href="/" className="navbar-left__link">
          Blog
        </a>
      </div>
      <div className="navbar-left__item">
        {' '}
        {showSearch ? (
          //   <form>
          <Input
            variant="outlined"
            placeholder="Search"
            inputlabel="Search"
            id="search"
            value={props.search}
            inputProps={{ 'aria-label': 'naked' }}
            onChange={handlesearchChange}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon style={{ color: '#415aff' }} />
              </InputAdornment>
            }
          />
        ) : //   </form>
        null}
      </div>
      <div className="navbar-left__item">
        <div
          className="navbar-left__link navbar-left__link-blue"
          onClick={renderSearch}
        >
          Search
        </div>
      </div>
    </div>
  );
  const rightNav = (
    <div className="navbar-right__container">Join the waitlist →</div>
  );

  return (
    <div className="navbar">
      {leftNav} {rightNav}
    </div>
  );
};

export default Navigation;

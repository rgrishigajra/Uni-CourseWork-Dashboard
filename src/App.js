import React, { useState } from 'react';
// import { Switch, Route } from 'react-router-dom';

import Navigation from './components/common/Navigation';

import { Search } from './containers';
// import { BrowserRouter } from 'react-router-dom';

import './App.css';

function App() {
  const [search, setSearch] = useState('');
  return (
    <div className="App">
      <Navigation search={search} setSearch={setSearch} />
      {/* <div style={{ scroll: 'overflow' }}> */}
        <Search search={search} />
      {/* </div> */}
      {/* <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Search} />
        </Switch>
      </BrowserRouter> */}
    </div>
  );
}

export default App;

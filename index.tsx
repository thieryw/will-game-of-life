import React, { Component, useCallback } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, getStore} from "./logic";

import {App} from "./App";



const Switcher: React.FunctionComponent = ()=>{
  
  const asyncGetStore = useAsync(getStore, []);
  
  
  
  return(
    <div>

      {
        asyncGetStore.loading ? <h1>Loading...</h1> : 
        <App store={asyncGetStore.result} />
      }

    </div>
  )
}




render(<Switcher />, document.getElementById('root'));

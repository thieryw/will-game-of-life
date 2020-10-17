import React, { Component } from 'react';
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
        <div className="wrapper"><App store={asyncGetStore.result} /></div>
      }

    </div>
  )
}




render(<Switcher />, document.getElementById('root'));

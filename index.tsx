import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, getStore} from "./logic";

import {App} from "./App";


const Switcher: React.FunctionComponent<{width: number; height: number}> = (props)=>{
  
  const asyncGetStore = useAsync(getStore, [props]);
  
  
  return(
    <div>

      {
        asyncGetStore.loading ? <h1>Loading...</h1> : <App store={asyncGetStore.result} />
      }

    </div>
  )
}




render(<Switcher width={20} height={20} />, document.getElementById('root'));

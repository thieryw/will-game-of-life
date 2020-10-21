import React, { Component, useCallback, useEffect } from 'react';
import { render } from 'react-dom';
import './style.scss';
import {useAsync} from "react-async-hook";
import {Store, getStore} from "./logic";

import {App} from "./components/App/App";



const Switcher: React.FunctionComponent = ()=>{
  
  const asyncGetStore = useAsync(getStore, []);
  
  useEffect(()=>{
    return ()=>{
      if(asyncGetStore.loading){
        return;
      }

      asyncGetStore.result.stopGame();
    }
  },[])
  
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

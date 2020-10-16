import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, getStore} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";


export const App: React.FunctionComponent<{
  store: Store;
}> = (props)=>{
  const {store} = props;
  return (
    <div>
      <h1>Ok...</h1>
    
    </div>
  )
}
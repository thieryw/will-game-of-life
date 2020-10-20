import React, { Component, useCallback, useReducer, useMemo, useEffect, useState } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsyncCallback} from "react-async-hook";
import {Store, Coordinates} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";
import {Cell} from "./Cell";
import {dimentions} from "./logic";

import {Buttons} from "./Buttons";


export const App: React.FunctionComponent<{
  store: Store;
}> = (props)=>{
  const {store} = props;
  const [, forceUpdate] = useReducer(x=>x+1, 0);
  

  const allCoordinates = useMemo(()=>{
    const out: Coordinates[] = [];

    for(let x = 0; x < dimentions.width; x++){
      for(let y = 0; y < dimentions.height; y++){
        out.push({x,y});
      }
    }
    

    return out;
  },[]);

  useEvt(ctx =>{
    store.evtGridCleaned.attach(
      ctx,
      ()=> forceUpdate()

    );
  },[store])


 
  
  return (
    <div className="wrapper">
      <h1>Game Of Life</h1>
      <div className="cells">
        {
          allCoordinates.map(coordinates => <Cell key={JSON.stringify(coordinates)} 
          coordinates={coordinates} 
          store={store} 
          />)
        }
      </div>

      <Buttons store={store} />
  
    </div>
  )
}


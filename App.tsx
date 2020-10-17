import React, { Component, useCallback, useReducer, useMemo } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, Coordinates} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";
import {Cell} from "./Cell";
import {dimentions} from "./logic";



export const App: React.FunctionComponent<{
  store: Store;
}> = (props)=>{
  const {store} = props;

  const allCoordinates = useMemo(()=>{
    const out: Coordinates[] = [];

    for(let x = 0; x < dimentions.width; x++){
      for(let y = 0; y < dimentions.height; y++){
        out.push({x,y});
      }
    }
    

    return out;
  },[])

  return (
    <div className="wrapper">
      <h1>Game of Life</h1>
      <div className="cells">
        {
          allCoordinates.map(coordinates => <Cell key={JSON.stringify(coordinates)} 
          coordinates={coordinates} 
          store={store} 
          />)
        }
      </div>
      
      <input className="next" 
        type="button" 
        value="next Cycle" 
        onClick={useCallback(()=> store.runGame(),[store])} 
      />
    </div>
  )
}



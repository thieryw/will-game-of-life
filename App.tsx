import React, { Component, useCallback, useReducer } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, Coordinates} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";
import {Cell} from "./Cell";
import {dimentions} from "./logic";

const coordX: number[] = [];
const coordY: number[] = [];

for(const x of [1,2]){
  for(let coord = 0; coord < dimentions.width; coord++){
    x === 1 ? coordX.push(coord) : coordY.push(coord);
  }
}


Evt.prototype.setMaxHandlers(400);
Evt.setDefaultMaxHandlers(400);

export const App: React.FunctionComponent<{
  store: Store;
}> = (props)=>{
  const {store} = props;
  return (
    <div className="cells">
      {
        coordX.map(x => coordY.map(y => <Cell key={`${x}${y}`} coordinates={{x,y}} store={store} />))
      }
    
    </div>
  )
}



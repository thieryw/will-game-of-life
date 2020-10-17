import React, { Component, useCallback, useReducer } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, Coordinates} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";
import { same } from "evt/tools/inDepth";


export const Cell: React.FunctionComponent<{
  coordinates: Coordinates;
  store: Pick<Store,
    "getCellAtCoord" |
    "changeCellState" |
    "evtCellStateChanged" 
  >
}> = (props)=>{

  const {store, coordinates} = props;
  const [, forceUpdate] = useReducer(x=>x+1, 0);

  const handleClick = useCallback(()=>{
    store.changeCellState({
      "x": coordinates.x,
      "y": coordinates.y
    })
  },[store])

  useEvt(ctx =>{
    store.evtCellStateChanged.attach(
      coordinates => same(coordinates, props.coordinates),
      ctx, 
      ()=> forceUpdate()

    );

  },[store])
  
  return(
    <div 
      className={`cell ${store.getCellAtCoord(coordinates)}`}
      onClick={handleClick}
    >


    </div>
  )
}
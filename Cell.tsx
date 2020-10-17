import React, { Component, useCallback, useReducer } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsync} from "react-async-hook";
import {Store, Coordinates} from "./logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";


export const Cell: React.FunctionComponent<{
  coordinates: Coordinates;
  store: Pick<Store,
    "getCellAtCoord" |
    "setCellState" |
    "evtCellStateSet" 
  >
}> = (props)=>{

  const {store, coordinates} = props;
  const [, forceUpdate] = useReducer(x=>x+1, 0);

  const handleClick = useCallback(()=>{
    store.setCellState({
      "cell": store.getCellAtCoord(coordinates) === "alive" ? "dead" : "alive",
      "coordinates": {
        "x": coordinates.x,
        "y": coordinates.y
      }
    })
  },[store])

  useEvt(ctx =>{
    store.evtCellStateSet.attach(
      data => data.coordinates.x === coordinates.x && data.coordinates.y === coordinates.y,
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
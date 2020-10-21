import React, { Component, useCallback, useReducer } from 'react';
import { render } from 'react-dom';
import "./Cell.scss";
import {useAsyncCallback} from "react-async-hook";
import {Store, Coordinates} from "../../logic";
import {useEvt} from "evt/hooks";
import {Evt} from "evt";
import { same } from "evt/tools/inDepth";
import { Spinner } from "../Spinner";


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
    asyncHandleClick.execute(coordinates);
  },[store]);

  const asyncHandleClick = useAsyncCallback(store.changeCellState);

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
      {
        asyncHandleClick.loading ? <Spinner /> : ""
      }


    </div>
  )
}
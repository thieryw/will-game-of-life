import React, { Component, useCallback, useReducer, useMemo, useState } from 'react';
import { render } from 'react-dom';
import './style.css';
import {useAsyncCallback} from "react-async-hook";
import {Store, Coordinates} from "../../logic";
import {useEvt, useStatefulEvt} from "evt/hooks";
import {Evt} from "evt";
import {Cell} from "../Cell/Cell";
import {dimentions} from "../../logic";



  export const Buttons: React.FunctionComponent<{
    store: Pick<Store,
      "runGame" |
      "nextState" |
      "stopGame" |
      "evtIsGameRuning" |
      "cleanGrid" |
      "evtGridCleaned"
    >
  }> = (props)=>{

    const {store} = props;
 


    const asyncNextState = useAsyncCallback(store.nextState);
    const asyncCleanGrid = useAsyncCallback(store.cleanGrid);

    useStatefulEvt([store.evtIsGameRuning])

    
    
    
    return(
      <div className="inputs">
        <input className="next" 
          type="button"
          disabled={asyncNextState.loading || 
            store.evtIsGameRuning.state || 
            asyncCleanGrid.loading
          } 
          value={asyncNextState.loading ? "Loading..." : "Next State"} 
          onClick={useCallback(()=> asyncNextState.execute(),[store])} 
        />
        <input 
          type="button" 
          disabled={store.evtIsGameRuning.state || asyncCleanGrid.loading}
          value="Run Game"
          onClick={useCallback(()=> store.runGame(),[store])} 
        />
        <input
          type="button"
          value="Stop Game"
          disabled={asyncCleanGrid.loading || !store.evtIsGameRuning.state}
          onClick={useCallback(()=> store.stopGame(), [store])}
        />
        <input
          type="button"
          value={asyncCleanGrid.loading ? "Loading..." : "Clean Grid"}
          disabled={asyncCleanGrid.loading || store.evtIsGameRuning.state}
          onClick={useCallback(()=> asyncCleanGrid.execute(), [store])}
        />
      </div>
    )
  }




   
import {NonPostableEvt, ToPostableEvt, Evt} from "evt";
import { Cell } from "./Cell";

export type Coordinates = {
  x: number;
  y: number;
}
type CellState = "dead" | "alive";


export const dimentions = {
  "width": 40,
  "height": 40
}

export type Store = {
  
  changeCellState: (coordinates: Coordinates) => Promise<void>;
  nextState: () => Promise<void>;
  getCellAtCoord: (coordinates: Coordinates) => CellState;
  cleanGrid: ()=> Promise<void>;
  runGame: ()=> Promise<void>;
  stopGame: ()=>void;
  

  evtGridCleaned: NonPostableEvt<CellState[][]>;
  evtCellStateChanged: NonPostableEvt<Coordinates>;
  evtIsGameRuning: NonPostableEvt<boolean>;
 


};

function getAllCellsInContactWithCell(params: {coordinates: Coordinates; cells: CellState[][]}): CellState[]{
  
  const {coordinates, cells} = params;
  
  //100% spagety

  const getCellsInContact = (
    params: {yAbove: number, yBeneath: number, xLeft: number, xRight: number}
  )=>{
    const result: CellState[] = [];
    const {yAbove, yBeneath, xLeft, xRight} = params;
    for(const n of [yAbove, 0, yBeneath]){
      result.push(cells[coordinates.x + xLeft][coordinates.y + n]);
      result.push(cells[coordinates.x + xRight][coordinates.y + n]);

      if(n === yAbove || n === yBeneath){
        result.push(cells[coordinates.x][coordinates.y + n]);
      }
    };

    return result;
  }

  /*if(coordinates.x === 0){
    if(coordinates.y === 0){
            
      return getCellsInContact(
        {"xLeft": 1, "xRight": dimentions.width, "yAbove": 1, "yBeneath": dimentions.height}
      );
    }

    if(coordinates.y === dimentions.height - 1){

      return getCellsInContact(
        {"xLeft": 1, "xRight": dimentions.width, "yAbove": 1, "yBeneath": -dimentions.height}
      );
    }


  }*/
  

  return getCellsInContact(
        {"xLeft": -1, "xRight": 1, "yAbove": -1, "yBeneath": 1}
      );

}




function getNextCellState(
  params: {coordinates: Coordinates; cells: CellState[][]}
): CellState{

  const {coordinates, cells} = params;
  const isOnEdge: boolean = coordinates.x === 0 || coordinates.x === dimentions.width - 1 ||
                            coordinates.y === 0 || coordinates.y === dimentions.height - 1;
  
  let result: CellState;
  let numberOfLiveCellsInContact = 0;
  if(isOnEdge){
    return "dead";
  }
  const cellsInContact = getAllCellsInContactWithCell(params);

  cellsInContact.forEach(cell => {
    if(cell === "alive"){
      numberOfLiveCellsInContact++;
    }
  });


  switch(cells[coordinates.x][coordinates.y]){
    case "alive" : result = numberOfLiveCellsInContact < 2 || numberOfLiveCellsInContact > 3 ? 
                            "dead" : "alive"; break;
    
    case "dead" : result = numberOfLiveCellsInContact === 3 ? "alive" : "dead"; break;
  }

  return result;

}


export async function getStore(): Promise<Store>{
  
  const simulateNetworkDelay = (delay: number)=>{
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }
  
  const cells: CellState[][] = [[]];
  for(let x = 0; x < dimentions.width; x++){
      cells.push([]);
    for(let y = 0; y < dimentions.height; y++){
      cells[x].push("dead");
    };
  };

  let isGameRuning = false;

  const store: ToPostableEvt<Store> = {
    "cleanGrid": async ()=>{
      await simulateNetworkDelay(300);

      for(let x = 0; x < dimentions.width; x++){
        for(let y = 0; y <dimentions.height; y++){
          cells[x][y] = "dead";
        }
      }

      store.evtGridCleaned.post(cells);

    },
    "getCellAtCoord": coordinates => cells[coordinates.x][coordinates.y],
    "changeCellState": async coordinates =>{
      
      await simulateNetworkDelay(300);
      
      const cell = store.getCellAtCoord(coordinates);
      
      cells[coordinates.x][coordinates.y] = cell === "alive" ? "dead" : "alive";

      store.evtCellStateChanged.post(coordinates);




    },
    "nextState": async ()=>{
      
      await simulateNetworkDelay(200);
      
      const changedCells: {cellState: CellState; coordinates: Coordinates}[] = [];
      
      cells.forEach((line, x) => line.forEach((cell, y) =>{
        
        const nextCellState = getNextCellState({"cells": cells, "coordinates": {x,y}});
        
        if(nextCellState !== cell){

         changedCells.push({"cellState": nextCellState, "coordinates": {x,y}});
        }
      }));


      changedCells.forEach(cell => {
        cells[cell.coordinates.x][cell.coordinates.y] = cell.cellState;
        store.evtCellStateChanged.post(cell.coordinates);
      });
    },

    "runGame": async ()=>{
      isGameRuning = true;
      store.evtIsGameRuning.post(isGameRuning);
      const interval = setInterval(() =>{
        if(!isGameRuning){
          clearInterval(interval);
        }
        store.nextState();
      },500)
    },
    "stopGame": ()=> {
      isGameRuning = false;
      store.evtIsGameRuning.post(isGameRuning)
    },

    "evtCellStateChanged": new Evt(),
    "evtGridCleaned": new Evt(),
    "evtIsGameRuning": new Evt(),

    
  };

  [
    store.evtCellStateChanged,
    store.evtGridCleaned,
  ].map(evt=> evt.setMaxHandlers(Infinity));

  await simulateNetworkDelay(1500);

  return store;



}



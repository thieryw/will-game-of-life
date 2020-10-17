import {NonPostableEvt, ToPostableEvt, Evt} from "evt";

export type Coordinates = {
  x: number;
  y: number;
}
type CellState = "dead" | "alive";


export const dimentions = {
  "width": 20,
  "height": 20
}

export type Store = {
  
  changeCellState: (coordinates: Coordinates) => Promise<void>;
  runGame: () => void;
  getCellAtCoord: (coordinates: Coordinates) => CellState;
  cleanGrid: ()=> Promise<void>;
  

  evtGridCleaned: NonPostableEvt<CellState[][]>;
  evtCellStateChanged: NonPostableEvt<Coordinates>;

};

function getAllCellsInContactWithCell(params: {coordinates: Coordinates; cells: CellState[][]}): CellState[]{
  
  const {coordinates, cells} = params;
  
  const result: CellState[] = [];

  

  for(const n of [-1, 0, 1]){
    result.push(cells[coordinates.x - 1][coordinates.y + n]);
    result.push(cells[coordinates.x + 1][coordinates.y + n]);
  };

  for(const n of [-1, 1]){
    result.push(cells[coordinates.x][coordinates.y + n]);
  }





  return result;
}


function getNextCellState(params: {coordinates: Coordinates; cells: CellState[][]}): CellState{
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


  const store: ToPostableEvt<Store> = {
    "cleanGrid": async ()=>{
      await simulateNetworkDelay(300);

      cells.forEach(line =>{
        line.forEach(cell => cell = "dead");
      });

      store.evtGridCleaned.post(cells);

    },
    "getCellAtCoord": coordinates => cells[coordinates.x][coordinates.y],
    "changeCellState": async coordinates =>{
      
      await simulateNetworkDelay(300);
      
      const cell = store.getCellAtCoord(coordinates);
      
      cells[coordinates.x][coordinates.y] = cell === "alive" ? "dead" : "alive";

      store.evtCellStateChanged.post(coordinates);




    },
    "runGame": ()=>{
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

    "evtCellStateChanged": new Evt(),
    "evtGridCleaned": new Evt()
  };

  await simulateNetworkDelay(1500);

  return store;



}



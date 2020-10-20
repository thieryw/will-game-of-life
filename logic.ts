import {NonPostableEvt, ToPostableEvt, Evt, StatefulReadonlyEvt} from "evt";
import { Cell } from "./Cell";

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
  nextState: () => Promise<void>;
  getCellAtCoord: (coordinates: Coordinates) => CellState;
  cleanGrid: ()=> Promise<void>;
  runGame: ()=> Promise<void>;
  stopGame: ()=>void;
  

  evtGridCleaned: NonPostableEvt<CellState[][]>;
  evtCellStateChanged: NonPostableEvt<Coordinates>;
  evtIsGameRuning: StatefulReadonlyEvt<boolean>;
 


};

function getNumberOfLiveCellsAroundCell(
  params: {coordinates: Coordinates, cellStates: CellState[][]}
):number{
  const {coordinates, cellStates} = params;

 

  const getResult = (params: {above: number; beneath: number; left: number; right: number})=>{
    const {above, beneath, left, right} = params;
    let out = 0;
    for(const n of([left, 0, right])){
      if(out > 3){
        return out;
      }

      if(cellStates[coordinates.x + above][coordinates.y + n] === "alive") out++;
      if(cellStates[coordinates.x + beneath][coordinates.y + n] === "alive") out++;

      if(n === left || n === right){
        if(cellStates[coordinates.x][coordinates.y + n] === "alive") out++;
      }
    }

    return out;
  }


  if(coordinates.x === 0){
    
    if(coordinates.y === 0){
      
      return getResult({
        "above": dimentions.height -1,
        "beneath": 1,
        "left": dimentions.width - 1,
        "right": 1
      });
    }

    if(coordinates.y === dimentions.width - 1){
      return getResult({
        "above": dimentions.height - 1,
        "beneath": 1,
        "left": -1,
        "right": -dimentions.width + 1
      });
    }

    return getResult({
      "above": dimentions.height - 1,
      "beneath": 1,
      "left": -1,
      "right": 1
    });
  }

  if(coordinates.x === dimentions.height - 1){
    
    if(coordinates.y === 0){
      return getResult({
        "above": -1,
        "beneath": -dimentions.height+1,
        "left": dimentions.width - 1,
        "right": 1,
      });
    }
    if(coordinates.y === dimentions.width - 1){
      return getResult({
        "above": -1,
        "beneath": -dimentions.height + 1,
        "left": -1,
        "right": -dimentions.width + 1
      });
    }

    return getResult({
      "above": -1,
      "beneath": -dimentions.height + 1,
      "left": -1,
      "right": 1
    });
  }


  if(coordinates.y === 0){
    return getResult(
      {
        "above": -1,
        "beneath": 1,
        "left": dimentions.width -1,
        "right": 1
      }
    )
  }

  if(coordinates.y === dimentions.width - 1){
    return getResult(
      {
        "above": -1,
        "beneath": 1,
        "left": -1,
        "right": -dimentions.width + 1
      }
    )
  }


  return getResult(
    {
      "above": -1,
      "beneath": 1,
      "left": -1,
      "right": 1
    }
  )
}


function getNextCellState(params: {coordinates: Coordinates, cellStates: CellState[][]}): CellState{
  const {coordinates, cellStates} = params;
  const cellState = cellStates[coordinates.x][coordinates.y];

  const numberOfLiveCellsAroundCell = getNumberOfLiveCellsAroundCell(params);

  if(cellState === "alive"){
    if(numberOfLiveCellsAroundCell < 2 || numberOfLiveCellsAroundCell > 3){
      return "dead";
    }
    return "alive";
  }

 
  if(numberOfLiveCellsAroundCell === 3){
    return "alive";

  }
  return "dead";
  
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
      const newCells: {coodinates: Coordinates, cellState: CellState}[] = [];
      cells.forEach((line, x)=> {
        line.forEach((cellState, y)=>{
          const nextCellState = getNextCellState({"cellStates": cells, "coordinates":{x,y}});

          if(cellState === nextCellState){
            return;
          }

          newCells.push({"cellState": nextCellState, "coodinates": {x,y}});

        });
      });



      newCells.forEach(newCell =>{
        cells[newCell.coodinates.x][newCell.coodinates.y] = newCell.cellState;
        store.evtCellStateChanged.post({"x": newCell.coodinates.x, "y": newCell.coodinates.y});
      });
    },

    "runGame": async ()=>{
      
      store.evtIsGameRuning.state = true;
      const interval = setInterval(() =>{
        if(!store.evtIsGameRuning.state){
          clearInterval(interval);
          return;
        }
        store.nextState();
      },200)
    },
    "stopGame": ()=> {
      
      store.evtIsGameRuning.state = false;
    },

    "evtCellStateChanged": new Evt(),
    "evtGridCleaned": new Evt(),
    "evtIsGameRuning": Evt.create(false),

    
  };

  [
    store.evtCellStateChanged,
    store.evtGridCleaned,
  ].map(evt=> evt.setMaxHandlers(Infinity));

  await simulateNetworkDelay(1500);

  return store;



}



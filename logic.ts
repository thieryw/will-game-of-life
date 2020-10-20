import {NonPostableEvt, ToPostableEvt, Evt} from "evt";
import { Cell } from "./Cell";

export type Coordinates = {
  x: number;
  y: number;
}
type CellState = "dead" | "alive";


export const dimentions = {
  "width": 10,
  "height": 10
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


function getNextCellState(params: {coordinates: Coordinates, cellStates: CellState[][]}): CellState{
  const {coordinates, cellStates} = params;
  const cellState = cellStates[coordinates.x][coordinates.y];

  if(coordinates.x === 0 || coordinates.x === dimentions.width - 1 || 
    coordinates.y === 0 || coordinates.y === dimentions.height - 1
  ){
    return "dead";
  }

  const cellsArroundCell = (()=>{
    const out: CellState[] = [];

    for(const n of [1, 0, -1]){
      out.push(cellStates[coordinates.x - 1][coordinates.y + n]);
      out.push(cellStates[coordinates.x + 1][coordinates.y + n]);
      if(n === 1 || n === -1){
        out.push(cellStates[coordinates.x][coordinates.y + n]);
      }
    }

    return out;
  })();

  let numberOfLiveCellsAroundCell = 0;

  cellsArroundCell.forEach(cellState =>{
    if(cellState === "dead"){
      
      return;
    }

    numberOfLiveCellsAroundCell++;
  });

  

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



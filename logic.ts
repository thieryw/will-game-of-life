import {NonPostableEvt, ToPostableEvt, Evt} from "evt";

type Coordinates = {
  x: number;
  y: number;
}
type Cell = "dead" | "alive";


export type Store = {
  
  setCellState: (params: {cell: Cell; coordinates: Coordinates}) => Promise<void>;
  runGame: () => void;
  getCellAtCoord: (coordinates: Coordinates) => Cell;
  cleanGrid: ()=> Promise<void>;
  

  evtGridCleaned: NonPostableEvt<Cell[][]>;
  evtCellStateSet: NonPostableEvt<Parameters<Store["setCellState"]>[0]>;

};


export async function getStore(params : {width: number; height: number}): Promise<Store>{
  
  const simulateNetworkDelay = (delay: number)=>{
    return new Promise<void>(resolve => setTimeout(resolve, delay));
  }
  
  const cells: Cell[][] = [[]];
  for(let x = 0; x < params.width; x++){
      cells.push([]);
    for(let y = 0; y < params.height; y++){
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
    "setCellState": async params =>{
      
      await simulateNetworkDelay(300);
      
      const {coordinates, cell} = params
      cells[coordinates.x][coordinates.y] = cell;

      store.evtCellStateSet.post(params);




    },
    "runGame": ()=>{
      console.log("game runing");
    },

    "evtCellStateSet": new Evt(),
    "evtGridCleaned": new Evt()
  };

  await simulateNetworkDelay(1500);

  return store;



}



class Board {
   private size: number;
   private adjList: Set<number>[];
   private bridges: Set<number>[];

   constructor(
      size: number,
      board?: { [key: number]: number[] },
      bridges?: { [key: number]: number[] }
   ) {

         if (size <= 0 || size % 2 !== 0) {
            throw new Error("Board size must be a positive even number.");
         }

         this.size = size;
         this.adjList = Array.from(
            { length: size * size },
            () => new Set<number>()
         );

         this.bridges = Array.from(
            { length: size * size },
            () => new Set<number>()
         );

         if (board && bridges) {
            for (const [node, neighbors] of Object.entries(board)) {
               this.adjList[parseInt(node)] = new Set(neighbors);
            }

            for (const [node, neighbors] of Object.entries(bridges)) {
               this.bridges[parseInt(node)] = new Set(neighbors);
            }
         } else {
            this.initializeEdges();
         }
   }                                                           
    // here iam initializing the edges of the board
   private initializeEdges(): void {
      for (
         let rowStart = 0;
         rowStart < this.size * this.size;
         rowStart += this.size
      ) {
         for (let curr = rowStart; curr < rowStart + this.size; curr++) {
            if (curr + 1 < rowStart + this.size)
               this.adjList[curr].add(curr + 1);
            if (curr - 1 >= rowStart) this.adjList[curr].add(curr - 1);
            if (curr + this.size < this.size * this.size)
               this.adjList[curr].add(curr + this.size);
            if (curr - this.size >= 0) this.adjList[curr].add(curr - this.size);
         }
      }
   }

   private findBridges(
      disc: number[],
      low: number[],
      visited: boolean[],
      curr: number,
      parent: number,
      time: { value: number }
   ): void {
      disc[curr] = low[curr] = time.value++;
      visited[curr] = true;

      for (const nebr of this.adjList[curr]) {
         if (nebr === parent) continue;

         if (visited[nebr]) {
            // Back edge
            low[curr] = Math.min(low[curr], disc[nebr]);
         } else {
            this.findBridges(disc, low, visited, nebr, curr, time);

            low[curr] = Math.min(low[curr], low[nebr]);

            if (low[nebr] > disc[curr]) {
               this.bridges[curr].add(nebr);
            }
         }
      }
   }

   private findBridgesUtil(): void { // this function is used to find the bridges in the graph
      const n = this.size * this.size;
      const visited = new Array<boolean>(n).fill(false);
      const low = new Array<number>(n).fill(-1);
      const disc = new Array<number>(n).fill(-1);
      let time = { value: 0 };

      for (let i = 0; i < n; i++) {
         if (!visited[i]) {
            this.findBridges(disc, low, visited, i, -1, time);
         }
      }
   }


   private isValidNode(node: number): boolean {
      return node >= 0 && node < this.size * this.size;
   }

   private canRemoveEdge(u: number, v: number): boolean {
      if (!this.isValidNode(u) || !this.isValidNode(v)) return false;

      if (!this.adjList[u].has(v) || !this.adjList[v].has(u)) return false;

      return !this.bridges[u].has(v) && !this.bridges[v].has(u);
   }

   public placeBlocker( 
      blocker: {
         rmvEdge1: { from: number; to: number };
         rmvEdge2: { from: number; to: number };
      },
      playerPos: number
   ): boolean {
      const { rmvEdge1, rmvEdge2 } = blocker;

      //in case any of the node is invalid
      if (
         !this.isValidNode(rmvEdge1.from) ||
         !this.isValidNode(rmvEdge1.to) ||
         !this.isValidNode(rmvEdge2.from) ||
         !this.isValidNode(rmvEdge2.to) ||
         !this.isValidNode(playerPos)
      ) {
         return false;
      }

      if (!this.isValidBlocker(blocker, playerPos)) {
         return false;
      }

      //if either of the edges can't be removed
      if (
         !this.canRemoveEdge(rmvEdge1.from, rmvEdge1.to) ||
         !this.canRemoveEdge(rmvEdge2.from, rmvEdge2.to)
      ) {
         return false;
      }

      this.adjList[rmvEdge1.from].delete(rmvEdge1.to);
      this.adjList[rmvEdge1.to].delete(rmvEdge1.from);

      this.adjList[rmvEdge2.from].delete(rmvEdge2.to);
      this.adjList[rmvEdge2.to].delete(rmvEdge2.from);
      // jabh bhi valid blocker place hoga tbh tarjams chlega.. hindi
      //pehel se islie krenge taki o(1) mai pata lg jaye..hindi
      this.findBridgesUtil();
      return true;
   }

   private isValidBlocker(  // 4 dibbbe player aaas pass ke hone chiye taki valid blocker ho-- hindi
      blocker: {
         rmvEdge1: { from: number; to: number };
         rmvEdge2: { from: number; to: number };
      },
      playerPos: number
   ): boolean {
      const validBlockers = this.getValidBlockers(playerPos); // Get all possible valid blockers

      // Check if any valid blocker matches the given one
      return validBlockers.some(
         (valid) =>
            (valid.rmvEdge1.from === blocker.rmvEdge1.from &&
               valid.rmvEdge1.to === blocker.rmvEdge1.to &&
               valid.rmvEdge2.from === blocker.rmvEdge2.from &&
               valid.rmvEdge2.to === blocker.rmvEdge2.to) ||
            (valid.rmvEdge1.from === blocker.rmvEdge2.from &&
               valid.rmvEdge1.to === blocker.rmvEdge2.to &&
               valid.rmvEdge2.from === blocker.rmvEdge1.from &&
               valid.rmvEdge2.to === blocker.rmvEdge1.to)
      );
   }

   private getValidBlockers(playerPos: number): {
      rmvEdge1: { from: number; to: number };
      rmvEdge2: { from: number; to: number };
   }[] {
      const validBlockers = [];

      //valid blockers are:
      //(i, i + 1) and (i + size, i + size + 1)
      validBlockers.push({
        rmvEdge1: { from: playerPos, to: playerPos + 1 },
        rmvEdge2: {
           from: playerPos + this.size,
           to: playerPos + this.size + 1,
        },
     });
    
      //(i, i - 1) and (i + size, i + size - 1)
        validBlockers.push({
            rmvEdge1: { from: playerPos, to: playerPos - 1 },
            rmvEdge2: {
             from: playerPos + this.size,
             to: playerPos + this.size - 1,
            },
        });
      //(i, i + size) and (i + 1, i + size + 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos + this.size },
             rmvEdge2: {
                from: playerPos + 1,
                to: playerPos + this.size + 1,
             },
        });

      //(i, i + size) and (i - 1, i + size - 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos + this.size },
             rmvEdge2: {
                from: playerPos - 1,
                to: playerPos + this.size - 1,
             },
        });
      //(i, i + 1) and (i - size, i - size + 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos + 1 },
             rmvEdge2: {
                from: playerPos - this.size,
                to: playerPos - this.size + 1,
             },
        });
      //(i, i - 1) and (i - size, i - size - 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos - 1 },
             rmvEdge2: {
                from: playerPos - this.size,
                to: playerPos - this.size - 1,
             },
        });
      //(i, i - size) and (i + 1, i - size + 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos - this.size },
             rmvEdge2: {
                from: playerPos + 1,
                to: playerPos - this.size + 1,
             },
        });
      //(i, i - size) and (i - 1, i - size - 1)
        validBlockers.push({
             rmvEdge1: { from: playerPos, to: playerPos - this.size },
             rmvEdge2: {
                from: playerPos - 1,
                to: playerPos - this.size - 1,
             },
        });


      return validBlockers;
   }

   public canMove(u: number, v: number): boolean {

      return (
         this.isValidNode(u) &&
         this.isValidNode(v) &&
         this.adjList[u].has(v) &&
         this.adjList[v].has(u)
      );
   }

   public getBoardState(): { // recovery mechanism
      board: { [key: number]: number[] };
      bridges: { [key: number]: number[] };
      size: number;
   } {
      return {
         size: this.size,
         board: Object.fromEntries(
            this.adjList.map((neighbors, node) => [node, Array.from(neighbors)])
         ),
         bridges: Object.fromEntries(
            this.bridges.map((neighbors, node) => [node, Array.from(neighbors)])
         ),
      };
   }
}

export default Board;


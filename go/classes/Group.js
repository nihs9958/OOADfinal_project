class Group {
  static count = 0;
  id;
  stones = [];
  liberties = [];
  constructor(stones, liberties) {
    this.id = count++;
    this.stones = stones;
    this.liberties = liberties;
  }

  addStone(stone) {
    stone.group = this;
    this.stones.push(stone);
  }
}
export default Group;

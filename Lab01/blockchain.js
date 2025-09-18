const crypto = require("crypto");

// Клас Блок
class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;              // номер блоку
    this.timestamp = timestamp;      // час створення
    this.data = data;                // дані (наприклад, транзакції)
    this.previousHash = previousHash;// хеш попереднього блоку
    this.nonce = 0;                  // число для пошуку правильного хешу
    this.hash = this.calculateHash();// хеш поточного блоку
  }

  // обчислення хешу (SHA-256)
  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
      .digest("hex");
  }

  // майнінг блоку: шукаємо хеш, який починається з певної кількості нулів
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`✅ Блок намайнено: ${this.hash}`);
  }
}

// Клас Блокчейн
class Blockchain {
  constructor(difficulty = 3) {
    this.chain = [this.createGenesisBlock()]; // перший блок
    this.difficulty = difficulty;             // складність майнінгу
  }

  // створюємо перший блок
  createGenesisBlock() {
    return new Block(0, Date.now().toString(), "Genesis Block", "0");
  }

  // беремо останній блок
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // додаємо новий блок
  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      Date.now().toString(),
      data,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  // перевірка цілісності
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // перевірка хешу
      if (current.hash !== current.calculateHash()) return false;

      // перевірка зв'язку
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

// === Демонстрація ===
let myCoin = new Blockchain(3);

// додаємо кілька блоків
myCoin.addBlock({ amount: 10 });
myCoin.addBlock({ amount: 20 });
myCoin.addBlock({ amount: 30 });

// перевірка ланцюга
console.log("Blockchain valid?", myCoin.isChainValid()); // true

// змінюємо дані у другому блоці
myCoin.chain[1].data = "Hacked!";
console.log("Blockchain valid after hack?", myCoin.isChainValid()); // false

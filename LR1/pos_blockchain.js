// Використовую криптографічну бібліотеку для створення хешів
import crypto from "crypto";

// ===== Клас Валідатора =====
class Validator {
  constructor(name, stake) {
    this.name = name; // ім’я валідатора
    this.stake = stake; // кількість монет у ставці
  }
}

// ===== Функція для вибору валідатора (Proof-of-Stake) =====
function pickValidator(validators) {
  const total = validators.reduce((sum, v) => sum + v.stake, 0);
  let rand = Math.random() * total;

  for (let v of validators) {
    rand -= v.stake;
    if (rand <= 0) {
      return v;
    }
  }
  return validators[validators.length - 1];
}

// ===== Клас Блоку =====
class Block {
  constructor(index, timestamp, data, prevHash, validator) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = prevHash;
    this.validator = validator.name;
    this.hash = this.createHash();
  }

  createHash() {
    const info =
      this.index +
      this.timestamp +
      JSON.stringify(this.data) +
      this.previousHash +
      this.validator;

    return crypto.createHash("sha256").update(info).digest("hex");
  }
}

// ===== Клас Блокчейну =====
class Blockchain {
  constructor(validators) {
    this.chain = [this.createGenesisBlock()];
    this.validators = validators;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), "Початковий блок", "0", {
      name: "System",
      stake: 0,
    });
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const validator = pickValidator(this.validators);
    const prevBlock = this.getLastBlock();

    const newBlock = new Block(
      prevBlock.index + 1,
      Date.now(),
      data,
      prevBlock.hash,
      validator
    );

    this.chain.push(newBlock);
    console.log(
      ` Блок ${newBlock.index} створено валідатором ${validator.name} (ставка = ${validator.stake})`
    );
  }

  checkValidity() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];

      if (curr.hash !== curr.createHash()) return false;
      if (curr.previousHash !== prev.hash) return false;
    }
    return true;
  }
}

// ======== Демонстрація роботи ========
const validators = [
  new Validator("Alice", 5),
  new Validator("Bob", 10),
  new Validator("Charlie", 1),
];

const chain = new Blockchain(validators);

// Додаю 10 блоків з даними
for (let i = 1; i <= 10; i++) {
  chain.addBlock({ tx: `Транзакція №${i}` });
}

// Перевіряю чи дійсний ланцюг
console.log("\nЧи валідний ланцюг:", chain.checkValidity());

// ===== Експеримент із 50 блоками =====
const stats = { Alice: 0, Bob: 0, Charlie: 0 };

for (let i = 0; i < 50; i++) {
  const v = pickValidator(validators);
  stats[v.name]++;
}

console.log("\n Статистика виграшів серед валідаторів за 50 спроб:");
console.log(stats);

const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "", type = "standard") {
    this.index = index
    this.timestamp = timestamp
    this.data = data
    this.previousHash = previousHash
    this.nonce = 0
    this.type = type
    this.hash = this.calculateHash()
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce)
      .digest("hex")
  }

  mineBlock(difficulty) {
    console.time(`Майнінг блоку ${this.index}`)
    while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.timeEnd(`Майнінг блоку ${this.index}`)
    console.log(`✅ Block mined: ${this.hash}, Nonce: ${this.nonce}`)
  }

  mineBlockAlternative() {
    console.time(`Альтернативний майнінг блоку ${this.index}`)
    while (this.hash[2] !== "3") {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.timeEnd(`Альтернативний майнінг блоку ${this.index}`)
    console.log(`✅ Alt Block mined: ${this.hash}, Nonce: ${this.nonce}`)
  }
}

class Blockchain {
  constructor(difficulty = 3) {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = difficulty
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), "Genesis Block", "0", "standard")
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(data, useAlternative = false) {
    const type = useAlternative ? "alternative" : "standard"
    const newBlock = new Block(
      this.chain.length,
      Date.now().toString(),
      data,
      this.getLatestBlock().hash,
      type
    )

    if (useAlternative) {
      newBlock.mineBlockAlternative()
    } else {
      newBlock.mineBlock(this.difficulty)
    }

    this.chain.push(newBlock)
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i]
      const previous = this.chain[i - 1]

      if (current.hash !== current.calculateHash()) return false
      if (current.previousHash !== previous.hash) return false
      if (current.type === "standard" && !current.hash.startsWith("0".repeat(this.difficulty))) return false
    }
    return true
  }
}

let myCoin = new Blockchain(3)

myCoin.addBlock({ amount: 10 })
myCoin.addBlock({ amount: 20 }, true)
myCoin.addBlock({ amount: 30 })

console.log("\n✅ Blockchain valid?", myCoin.isChainValid())

myCoin.chain[1].data = "Hacked!"
console.log("❌ Blockchain valid after hack?", myCoin.isChainValid())

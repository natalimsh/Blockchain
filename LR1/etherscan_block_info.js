const RPC_URL = "https://ethereum.publicnode.com"; // новий надійний публічний RPC
const NUM_BLOCKS_FOR_AVERAGE = 5; // кількість блоків для розрахунку середньої

// Функція для JSON-RPC запиту (POST)
async function getRpcData(method, params = []) {
    const payload = {
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: 1 
    };

    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const textError = await response.text();
            throw new Error(`Помилка HTTP: Статус ${response.status} ${response.statusText}. Деталі: ${textError.substring(0, 50)}...`);
        }

        const jsonResponse = await response.json();

        if (jsonResponse.error) {
            throw new Error(`Помилка RPC: ${jsonResponse.error.message}`);
        }

        return jsonResponse.result;

    } catch (e) {
        throw new Error(`${e.message} для RPC методу: ${method}`);
    }
}

// Перетворює hex в десяткове число
function hexToDec(hex) {
    if (!hex || hex === '0x') return '0';
    return BigInt(hex).toString();
}

// Перетворює timestamp в зрозумілий формат дати
function convertTimestamp(timestampDec) {
    try {
        const timestampMs = parseInt(timestampDec) * 1000;
        return new Date(timestampMs).toLocaleString('uk-UA', { timeZone: 'UTC' }) + ' UTC';
    } catch (e) {
        return "Недійсний час"; // можлива помилка при перетворенні
    }
}

// Вивід основних даних блоку
function printBlockDetails({ blockNumberDec, timestampDec, transactionsCount, blockInfo }) {
    console.log(`Номер блоку (десяткове):         ${blockNumberDec}`);
    console.log(`Час створення:                   ${convertTimestamp(timestampDec)}`);
    console.log(`Кількість транзакцій у блоці:    ${transactionsCount}`);
    console.log(`Хеш блоку:                       ${blockInfo.hash}`);
    console.log(`Хеш попереднього блоку:          ${blockInfo.parentHash}`);
}

// Розрахунок середньої кількості транзакцій за останні N блоків
async function calculateAverageTxCount(startBlockNumber) {
    console.log(`Розрахунок середньої кількості транзакцій за останні ${NUM_BLOCKS_FOR_AVERAGE} блоків`);

    let totalTransactions = 0;
    let successfulBlocks = 0;
    
    for (let i = 0; i < NUM_BLOCKS_FOR_AVERAGE; i++) {
        const blockToFetch = startBlockNumber - BigInt(i);
        const blockHex = '0x' + blockToFetch.toString(16);
        
        try {
            const blockInfo = await getRpcData("eth_getBlockByNumber", [blockHex, true]); 
            
            if (blockInfo) {
                const txCount = blockInfo.transactions ? blockInfo.transactions.length : 0;
                totalTransactions += txCount;
                successfulBlocks += 1;
                console.log(`Блок ${blockToFetch.toString()} Транзакцій: ${txCount}`);
            }
        } catch (error) {
            console.warn(`Блок ${blockToFetch.toString()} Попередження: Не вдалося отримати дані: ${error.message}`);
            break; // якщо не отримали блок, припиняємо цикл
        }
    }

    const averageTx = successfulBlocks > 0 ? (totalTransactions / successfulBlocks).toFixed(2) : 0;

    console.log("РЕЗУЛЬТАТ: Середня кількість транзакцій (ETHEREUM)");
    console.log(`Оброблені блоки: ${successfulBlocks}/${NUM_BLOCKS_FOR_AVERAGE}`);
    console.log(`Загальна кількість транзакцій: ${totalTransactions}`);
    console.log(`СЕРЕДНЄ ЗНАЧЕННЯ: ${averageTx} транзакцій на блок`);
}

async function main() {
    try {
        // ПУНКТ 2: Отримання номера останнього блоку
        console.log("Отримання номера останнього блоку (Ethereum Mainnet via RPC)");
        const latestBlockHex = await getRpcData("eth_blockNumber");
        const latestBlockDec = hexToDec(latestBlockHex);
        console.log(`Номер останнього блоку (DEC): ${latestBlockDec}`);

        // ПУНКТ 3: Отримання інформації про останній блок
        console.log("Отримання повної інформації про останній блок");
        const blockInfo = await getRpcData("eth_getBlockByNumber", [latestBlockHex, true]);
        
        const blockNumberDec = hexToDec(blockInfo.number);
        const timestampDec = hexToDec(blockInfo.timestamp);
        const transactionsCount = blockInfo.transactions ? blockInfo.transactions.length : 0;

        // ПУНКТ 4: Вивід ключових параметрів блоку
        console.log("Ключові параметри останнього блоку");
        printBlockDetails({ blockNumberDec, timestampDec, transactionsCount, blockInfo });

        // ПУНКТ 6: Розрахунок середньої кількості транзакцій
        await calculateAverageTxCount(BigInt(latestBlockDec));

    } catch (error) {
        // ПУНКТ 5: Обробка помилок
        console.error("ГЛОБАЛЬНА ПОМИЛКА ВИКОНАННЯ:");
        console.error(`${error.message}`);
        console.error("Якщо це не працює, можна спробувати Infura або Alchemy");
    }
}

// Запуск скрипта
main();

var https = require('https')
const TelegramBot = require('node-telegram-bot-api')
var moment = require('moment')
moment.locale('it')
// Reading config file content
const config = require('./config.json')
// We need milliseconds, so seconds * 1000
const interval = config.interval_seconds * 1000
// Array of cryptocurrencies
const coins = config.cryptocurrencies
// Telegram user ID, updater status and number of coins
var myChatId, status = "start"
const numberOfCoins = coins.length
// Cryptocompare API URL
const url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + coins.toString() + "&tsyms=USD,EUR"

// Bot standard messages
const welcomeMessage = "Benvenuto!\nCon questo bot telegram puoi ricevere ogni N secondi/minuti " +
                        "i prezzi delle tue monete preferite!\n" +
                        "Ti basterà modificare il file config.json, eseguire il bot " +
                        "e usare il comando /play e /stop\n" +
                        "Visita coiners.it per avere maggiori informazioni e assistenza per il Bot!"

const helpMessage = "1. Inserisci le tue cryptovalute all'interno del file config.json\n" +
                    "2. Inserisci l'intervallo in secondi\n" +
                    "3. Avvia il bot con <npm start>" +
                    "4. Da smartphone usa il comando /play\n" +
                    "5. Fine!"

const startedMessage = "Bot avviato..\n"

const pausedMessage = "Bot in pausa..\n"

// The bot was born here..
const bot = new TelegramBot(config.token, {
    polling: true
})

// Start command, save Chat ID into myChatId
bot.onText(/\/start/, (msg, match) => {
    myChatId = msg.chat.id
	bot.sendMessage(myChatId, welcomeMessage)
})

// Set bot status to 'start', the bot will start to send us updates
bot.onText(/\/play/, (msg, match) => {
    status = "start"
    startLoop()
	bot.sendMessage(myChatId, startedMessage)
})

// Set bot status to 'paused'
bot.onText(/\/stop/, (msg, match) => {
    status = "paused"
	bot.sendMessage(myChatId, pausedMessage)
})

// Send help command
bot.onText(/\/help/, (msg, match) => {
	bot.sendMessage(myChatId, helpMessage)
})

/** This function is the real updater.
 *  We check the bot status, get coins prices, parse JSON response from the API and parse content
 *  Finally, we can send the response to the user! 
 */
function startLoop(){
    setInterval(function(){
        if(status === "start"){
            var response = moment().format('D MMMM YYYY, HH:mm:ss')
            response += "\n--------------------------------------------\n"
            var req = https.get(url, function(res) {
                var bodyChunks = []
                res.on('data', function(chunk) {
                    bodyChunks.push(chunk)
                }).on('end', function() {
                    let body = Buffer.concat(bodyChunks);
                    let bodyJson = JSON.parse(body.toString('utf8'))
                    for(var i=0; i < numberOfCoins; i++){
                        response = response + config.cryptocurrencies[i] + " = " + bodyJson[config.cryptocurrencies[i]]["USD"] + "$ - " + bodyJson[config.cryptocurrencies[i]]["EUR"] + "€ \n"
                    }
                    bot.sendMessage(myChatId, response)
                })
            })
        }
    }, interval)
}
// Default values
let config = {
    wagonNumber: 255,
    ticketAmount: 2,
    previousTicketAmount: 2,
}

let configurationScene = document.getElementById('configuration')
let emulationScene = document.getElementById('emulation')

// INITIALIZATION OF CONFIGURATION SCENE
let configurationForm = document.querySelector('.configuration-form')
configurationForm.addEventListener("submit", function(event) {
    event.preventDefault()
    config.ticketAmount = parseInt(configurationForm.querySelector('input[name="tickets"]:checked').value)
    config.wagonNumber = configurationForm.querySelector('#wagon').value
    prepareEmulationScene(config)
    makeSceneActive(emulationScene)
    // This is "full-screen hack"
    window.scrollTo(0,1);
}, false)

// INITIALIZATION OF EMULATION SCENE
let ticketTemplate = document.querySelector('#ticket-template').content
let ticketContainer = document.querySelector('#emulation main.content')
// Back button behaviour
let backButton = document.querySelector('#emulation .btn.btn--back')
backButton.addEventListener('click', function (event) {
    makeSceneActive(configurationScene)
    while (ticketContainer.firstChild) {
        ticketContainer.removeChild(ticketContainer.firstChild);
    }
}, false)

// Generate and add ticket templates
function prepareEmulationScene(config){
    let now = new Date()
    ticketContainer.appendChild(ticketTemplate.cloneNode(true))
    let ticketEl = ticketContainer.lastElementChild
    initializeTicket(ticketEl, now, config.wagonNumber, false, config.ticketAmount)
    // Initialize previous tickets
    for (let i = 0; i < config.previousTicketAmount; i++) {
        let previousTicketEl = ticketEl.cloneNode(true)
        ticketContainer.appendChild(previousTicketEl)
        let date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1), randomInclusive(8, 22), randomInclusive(0, 59), randomInclusive(0, 59))
        let wagonNumber = ['325', '225', '205', '115', '027', '293'][randomInclusive(0, 5)]
        initializeTicket(previousTicketEl, date, wagonNumber, true, randomInclusive(1, 2))
    }

    function initializeTicket(ticketElem, time, wagonNumber, isUsed, amount) {
        let seriesEl = ticketElem.querySelector('.ticket__series .series')
        let wagonNumberEl = ticketElem.querySelector('.ticket__wagon .item__value')
        let dateEl = ticketElem.querySelector('.ticket__info > div:nth-child(1) > .item__value')
        let timeEl = ticketElem.querySelector('.ticket__info > div:nth-child(2) > .item__value')
        let amountEl = ticketElem.querySelector('.ticket__info > div:nth-child(3) > .item__value')
        let estimateEl = ticketElem.querySelector('.ticket__estimate .item__value')

        let dateString = time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
        let timeString = time.toLocaleDateString('en-GB').replace(/\//g, '.')
        dateEl.innerText = `${timeString}`
        timeEl.innerText = `${dateString}`
        seriesEl.innerText = generateSeries(amount)
        amountEl.innerText = amount + ((amount > 1) ? ' pcs.' : ' pc.')
        wagonNumberEl.innerText = "№" + wagonNumber

        if (isUsed) makeUsed()
        else updateEstimateLoop()

        function generateSeries(amount) {
            // Real-life series: "954098869, 622075315, 949979459"
            let numbers = []
            for (let i = 0; i < amount; i++) {
                numbers.push(randomInclusive(620000000, 960000000-1))
            }
            return numbers.join(', ')
        }

        function makeUsed() {
            ticketElem.classList.add('is-used')
            estimateEl.remove()
        }

        function updateEstimateLoop() {
            let now = new Date()
            let diff = 60 * 60 * 1000 - (now - time)
            if (diff < 0) return makeUsed()
            estimateEl.innerText = new Date(diff).toTimeString().replace(/.*(\d{2}:\d{2}).*/, "$1")
            setTimeout(updateEstimateLoop, 1000)
        }
    }

    // Inclusive random number generator
    function randomInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}


function makeSceneActive(frameEl){
    let frames = document.querySelectorAll('.app > section.scene')
    frames.forEach(frame => frame.classList.remove('is-active'))
    frameEl.classList.add('is-active')
}

// To set focus on input element when page has loaded
let wagonEl = document.getElementById('wagon')
wagonEl.focus()

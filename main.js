class App {
    static DefaultConfig = {
        wagonNumber: 255,
        ticketAmount: 2,
        previousTicketAmount: 2,
        isBus: false
    }

    constructor() {
        this.configurationScene = document.getElementById('configuration')
        this.emulationScene = document.getElementById('emulation')
        this.ticketTemplate = document.querySelector('#ticket-template').content
        this.ticketContainer = document.querySelector('#emulation main.content')

        this.initializeEmulationScene(this.emulationScene)
        this.initializeConfigurationScene(this.configurationScene)
    }

    initializeConfigurationScene(configurationScene) {
        let configurationForm = configurationScene.querySelector('.configuration-form')
        configurationForm.addEventListener("submit", (event) => {
            event.preventDefault()
            let config = this.readConfig(this.configurationScene)
            this.makeSceneActive(this.emulationScene)
            this.changeEmulation(config)
        }, false)

        // To set focus on input element when the page has loaded
        let wagonEl = document.getElementById('wagon')
        wagonEl.focus()
    }

    initializeEmulationScene(emulationScene, config) {
        // Back button behaviour
        let backButton = emulationScene.querySelector('.btn.btn--back')
        backButton.addEventListener('click', (event) => {
            this.makeSceneActive(this.configurationScene)
        }, false)
    }

    changeEmulation(config){
        // Remove all tickets
        while (this.ticketContainer.firstChild) {
            this.ticketContainer.removeChild(this.ticketContainer.firstChild);
        }

        let now = new Date()
        // Initialize current ticket
        this.ticketContainer.appendChild(this.ticketTemplate.cloneNode(true))
        let ticketEl = this.ticketContainer.lastElementChild
        initializeTicket(ticketEl, now, config.wagonNumber, false, config.ticketAmount, config.isBus)
        // Initialize previous tickets
        for (let i = 0; i < config.previousTicketAmount; i++) {
            this.ticketContainer.appendChild(this.ticketTemplate.cloneNode(true))
            let ticketEl = this.ticketContainer.lastElementChild
            let date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1), randomInclusive(8, 22), randomInclusive(0, 59), randomInclusive(0, 59))
            let wagonNumber = ['325', '225', '205', '115', '027', '293'][randomInclusive(0, 5)]
            initializeTicket(ticketEl, date, wagonNumber, true, randomInclusive(1, 2), false)
        }

        function initializeTicket(ticketElem, time, wagonNumber, isUsed, amount, isBus) {
            let seriesEl = ticketElem.querySelector('.ticket__series .series')
            let wagonNumberEl = ticketElem.querySelector('.ticket__wagon .item__value')
            let dateEl = ticketElem.querySelector('.ticket__info > div:nth-child(1) > .item__value')
            let timeEl = ticketElem.querySelector('.ticket__info > div:nth-child(2) > .item__value')
            let amountEl = ticketElem.querySelector('.ticket__info > div:nth-child(3) > .item__value')
            let estimateEl = ticketElem.querySelector('.ticket__estimate .item__value')
            // For bus
            let companyNameEl = ticketElem.querySelector('.ticket__company-name')
            let imageEl = ticketElem.querySelector('.ticket__image > img')
            let transportTypeEl = ticketElem.querySelector('.ticket__wagon > .item > .item__title')

            let dateString = time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1")
            let timeString = time.toLocaleDateString('en-GB').replace(/\//g, '.')
            dateEl.innerText = `${timeString}`
            timeEl.innerText = `${dateString}`
            seriesEl.innerText = generateSeries(amount)
            amountEl.innerText = amount + ((amount > 1) ? ' pcs.' : ' pc.')
            wagonNumberEl.innerText = "№" + wagonNumber

            if (isBus) {
                imageEl.setAttribute('src', 'images/ticket-bus.jpg')
                companyNameEl.innerText = "КП Вінницька транспортна компанія автобуси"
                transportTypeEl.innerText = "Автобус"
            }

            if (isUsed) makeUsed()
            else updateEstimateLoop()

            function generateSeries(amount) {
                // Real-life series: "954098869, 622075315, 949979459"
                let numbers = []
                for (let i = 0; i < amount; i++) {
                    numbers.push(randomInclusive(620000000, 960000000 - 1))
                }
                return numbers.join(', ')
            }

            function makeUsed() {
                ticketElem.classList.add('is-used')
                estimateEl.remove()
            }

            function updateEstimateLoop() {
                if(!ticketElem) return
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

    readConfig(configurationScene) {
        let configurationForm = configurationScene.querySelector('.configuration-form')
        return Object.assign(App.DefaultConfig, {
            ticketAmount: parseInt(configurationForm.querySelector('input[name="tickets"]:checked').value),
            wagonNumber: configurationForm.querySelector('#wagon').value,
            isBus: configurationForm.querySelector('input[name="bus-switch"]:checked').value === "bus"
        })
    }

    makeSceneActive(scene){
        let scenes = document.querySelectorAll('.app > section.scene')
        scenes.forEach(frame => frame.classList.remove('is-active'))
        scene.classList.add('is-active')
    }
}

let app = new App()
